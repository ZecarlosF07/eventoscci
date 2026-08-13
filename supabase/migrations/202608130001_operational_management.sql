create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  action varchar(150) not null,
  entity_type varchar(100) not null,
  entity_id uuid,
  old_data jsonb,
  new_data jsonb,
  metadata jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now(),
  constraint audit_logs_action_not_blank check (length(btrim(action)) > 0),
  constraint audit_logs_entity_type_not_blank check (length(btrim(entity_type)) > 0)
);

create index idx_audit_logs_entity
on public.audit_logs(entity_type, entity_id);

create index idx_audit_logs_actor
on public.audit_logs(actor_user_id);

create index idx_audit_logs_created_at
on public.audit_logs(created_at desc);

create index idx_attendance_status_active
on public.attendance(status)
where deleted_at is null;

create index idx_registrations_type_active
on public.registrations(registration_type)
where deleted_at is null;

alter table public.audit_logs enable row level security;

revoke all on table public.audit_logs from anon, authenticated;
grant select on table public.audit_logs to authenticated;
grant all on table public.audit_logs to service_role;

create policy audit_logs_admin_read
on public.audit_logs
for select
to authenticated
using ((select public.is_active_admin()));

create or replace function public.confirm_registration(p_registration_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_activity public.activities%rowtype;
  v_new public.registrations%rowtype;
  v_old public.registrations%rowtype;
begin
  if not public.is_active_admin() then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;

  select *
  into v_old
  from public.registrations
  where id = p_registration_id
    and deleted_at is null
  for update;

  if not found then
    raise exception 'REGISTRATION_NOT_FOUND' using errcode = 'P0001';
  end if;

  if v_old.status = 'cancelled' then
    raise exception 'INVALID_REGISTRATION_STATUS' using errcode = 'P0001';
  end if;

  if v_old.status = 'confirmed' then
    return jsonb_build_object(
      'changed', false,
      'registration_id', v_old.id,
      'status', v_old.status
    );
  end if;

  update public.registrations
  set
    status = 'confirmed',
    confirmed_at = now(),
    confirmed_by = auth.uid()
  where id = v_old.id
  returning * into v_new;

  select * into strict v_activity
  from public.activities
  where id = v_new.activity_id;

  if not v_activity.is_free then
    insert into public.notification_outbox (
      person_id,
      event_type,
      recipient_email,
      related_entity_type,
      related_entity_id,
      payload
    )
    select
      v_new.person_id,
      'activity_paid_registration_confirmed',
      people.email,
      'registration',
      v_new.id,
      jsonb_build_object(
        'activity_id', v_activity.id,
        'activity_slug', v_activity.slug,
        'activity_title', v_activity.title,
        'activity_type', v_activity.type,
        'registration_code', v_new.registration_code,
        'registration_status', v_new.status
      )
    from public.people
    where people.id = v_new.person_id
    on conflict (event_type, related_entity_type, related_entity_id)
      where deleted_at is null and related_entity_id is not null
    do nothing;
  end if;

  insert into public.audit_logs (
    actor_user_id, action, entity_type, entity_id, old_data, new_data
  ) values (
    auth.uid(), 'registration.confirmed', 'registration', v_new.id,
    to_jsonb(v_old), to_jsonb(v_new)
  );

  return jsonb_build_object(
    'changed', true,
    'registration_id', v_new.id,
    'status', v_new.status
  );
end;
$$;

create or replace function public.cancel_registration(
  p_registration_id uuid,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_new public.registrations%rowtype;
  v_old public.registrations%rowtype;
  v_reason text := nullif(btrim(p_reason), '');
begin
  if not public.is_active_admin() then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;

  if v_reason is not null and length(v_reason) > 500 then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  select *
  into v_old
  from public.registrations
  where id = p_registration_id
    and deleted_at is null
  for update;

  if not found then
    raise exception 'REGISTRATION_NOT_FOUND' using errcode = 'P0001';
  end if;

  if v_old.status = 'cancelled' then
    return jsonb_build_object(
      'changed', false,
      'registration_id', v_old.id,
      'status', v_old.status
    );
  end if;

  update public.registrations
  set
    status = 'cancelled',
    cancelled_at = now(),
    cancelled_by = auth.uid(),
    cancellation_reason = v_reason
  where id = v_old.id
  returning * into v_new;

  insert into public.audit_logs (
    actor_user_id, action, entity_type, entity_id, old_data, new_data
  ) values (
    auth.uid(), 'registration.cancelled', 'registration', v_new.id,
    to_jsonb(v_old), to_jsonb(v_new)
  );

  return jsonb_build_object(
    'changed', true,
    'registration_id', v_new.id,
    'status', v_new.status
  );
end;
$$;

create or replace function public.update_participant(
  p_person_id uuid,
  p_person jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_company text := nullif(btrim(p_person->>'company'), '');
  v_email text := lower(btrim(p_person->>'email'));
  v_first_names text := btrim(p_person->>'first_names');
  v_job_title text := btrim(p_person->>'job_title');
  v_last_names text := btrim(p_person->>'last_names');
  v_new public.people%rowtype;
  v_old public.people%rowtype;
  v_phone text := regexp_replace(btrim(p_person->>'phone'), '[[:space:]-]', '', 'g');
  v_ruc text := nullif(btrim(p_person->>'ruc'), '');
  v_address text := nullif(btrim(p_person->>'address'), '');
begin
  if not public.is_active_admin() then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;

  if v_first_names is null or length(v_first_names) < 2 or length(v_first_names) > 120
    or v_last_names is null or length(v_last_names) < 2 or length(v_last_names) > 120
    or v_email is null or length(v_email) > 320
    or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or v_phone is null or v_phone !~ '^\+?[0-9]{7,15}$'
    or v_job_title is null or length(v_job_title) < 2 or length(v_job_title) > 150
    or (v_ruc is not null and v_ruc !~ '^[0-9]{11}$')
  then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  select *
  into v_old
  from public.people
  where id = p_person_id
    and deleted_at is null
  for update;

  if not found then
    raise exception 'PARTICIPANT_NOT_FOUND' using errcode = 'P0001';
  end if;

  update public.people
  set
    first_names = v_first_names,
    last_names = v_last_names,
    email = v_email,
    phone = v_phone,
    job_title = v_job_title,
    company = v_company,
    ruc = v_ruc,
    address = v_address
  where id = v_old.id
  returning * into v_new;

  if to_jsonb(v_old) - array['updated_at'] = to_jsonb(v_new) - array['updated_at'] then
    return v_new.id;
  end if;

  insert into public.audit_logs (
    actor_user_id, action, entity_type, entity_id, old_data, new_data
  ) values (
    auth.uid(), 'participant.updated', 'person', v_new.id,
    to_jsonb(v_old), to_jsonb(v_new)
  );

  return v_new.id;
end;
$$;

create or replace function public.set_attendance_status(
  p_attendance_ids uuid[],
  p_status public.attendance_status,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_changed integer := 0;
  v_expected integer;
  v_new public.attendance%rowtype;
  v_notes text := case
    when p_notes is null then null
    else nullif(btrim(p_notes), '')
  end;
  v_old public.attendance%rowtype;
  v_processed integer := 0;
begin
  if not public.is_active_admin() then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;

  v_expected := cardinality(p_attendance_ids);
  if v_expected is null or v_expected = 0 or v_expected > 500 then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  if p_notes is not null and length(btrim(p_notes)) > 500 then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  for v_old in
    select attendance.*
    from public.attendance
    join public.registrations on registrations.id = attendance.registration_id
    where attendance.id = any(p_attendance_ids)
      and attendance.deleted_at is null
      and registrations.deleted_at is null
    order by attendance.id
    for update of attendance
  loop
    v_processed := v_processed + 1;

    if v_old.status = p_status
      and (p_notes is null or v_old.notes is not distinct from v_notes)
    then
      continue;
    end if;

    update public.attendance
    set
      status = p_status,
      marked_at = case when p_status = 'pending' then null else now() end,
      marked_by = case when p_status = 'pending' then null else auth.uid() end,
      notes = case when p_notes is null then notes else v_notes end
    where id = v_old.id
    returning * into v_new;

    insert into public.audit_logs (
      actor_user_id, action, entity_type, entity_id, old_data, new_data,
      metadata
    ) values (
      auth.uid(), 'attendance.status_changed', 'attendance', v_new.id,
      to_jsonb(v_old), to_jsonb(v_new),
      jsonb_build_object('bulk_size', v_expected)
    );

    v_changed := v_changed + 1;
  end loop;

  if v_processed <> v_expected then
    raise exception 'ATTENDANCE_NOT_FOUND' using errcode = 'P0001';
  end if;

  return jsonb_build_object(
    'changed', v_changed,
    'processed', v_processed,
    'status', p_status
  );
end;
$$;

revoke execute on function public.confirm_registration(uuid) from public;
revoke execute on function public.cancel_registration(uuid, text) from public;
revoke execute on function public.update_participant(uuid, jsonb) from public;
revoke execute on function public.set_attendance_status(uuid[], public.attendance_status, text) from public;

grant execute on function public.confirm_registration(uuid) to authenticated, service_role;
grant execute on function public.cancel_registration(uuid, text) to authenticated, service_role;
grant execute on function public.update_participant(uuid, jsonb) to authenticated, service_role;
grant execute on function public.set_attendance_status(uuid[], public.attendance_status, text) to authenticated, service_role;

comment on table public.audit_logs is 'Bitácora append-only de operaciones administrativas sensibles.';
comment on function public.confirm_registration(uuid) is 'Confirma idempotentemente una preinscripción y prepara su notificación.';
comment on function public.cancel_registration(uuid, text) is 'Cancela una inscripción preservando su historial.';
comment on function public.update_participant(uuid, jsonb) is 'Actualiza los datos actuales de una persona sin modificar snapshots.';
comment on function public.set_attendance_status(uuid[], public.attendance_status, text) is 'Actualiza asistencia individual o masiva de forma atómica.';
