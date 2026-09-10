-- Configure certificates as unavailable, included, or optionally paid per activity.

alter table public.activities
  add column certificate_mode text not null default 'none',
  add column certificate_general_price numeric(10, 2) not null default 0,
  add column certificate_member_price numeric(10, 2) not null default 0;

alter table public.activities
  add constraint activities_certificate_mode_valid check (
    certificate_mode in ('none', 'included', 'optional_paid')
  ),
  add constraint activities_certificate_prices_nonnegative check (
    certificate_general_price >= 0 and certificate_member_price >= 0
  ),
  add constraint activities_certificate_prices_match_mode check (
    (
      certificate_mode in ('none', 'included')
      and certificate_general_price = 0
      and certificate_member_price = 0
    )
    or (
      certificate_mode = 'optional_paid'
      and certificate_general_price > 0
      and certificate_member_price > 0
      and certificate_member_price <= certificate_general_price
    )
  );

create or replace function public.save_activity(
  p_activity jsonb,
  p_dates jsonb,
  p_speakers jsonb
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_activity_id uuid := nullif(p_activity->>'id', '')::uuid;
  v_date jsonb;
  v_speaker jsonb;
  v_status public.activity_status := coalesce(
    nullif(p_activity->>'status', '')::public.activity_status,
    'draft'
  );
begin
  if not public.is_active_admin() then
    raise exception 'No autorizado para gestionar actividades.' using errcode = '42501';
  end if;

  if jsonb_typeof(p_dates) <> 'array' or jsonb_array_length(p_dates) = 0 then
    raise exception 'La actividad requiere al menos una fecha.' using errcode = '22023';
  end if;

  if v_activity_id is null then
    v_activity_id := extensions.gen_random_uuid();
    insert into public.activities (
      id, category_id, venue_id, contact_id, type, title, slug,
      short_description, description, objective, target_audience, modality,
      virtual_url, duration_text, academic_hours, program, syllabus, banner_path,
      is_free, general_price, member_price, members_only, capacity,
      certificate_mode, certificate_general_price, certificate_member_price,
      registration_open_at, registration_close_at,
      registrations_closed_manually, additional_info, status, published_at,
      created_by, updated_by
    ) values (
      v_activity_id,
      nullif(p_activity->>'category_id', '')::uuid,
      nullif(p_activity->>'venue_id', '')::uuid,
      nullif(p_activity->>'contact_id', '')::uuid,
      (p_activity->>'type')::public.activity_type,
      btrim(p_activity->>'title'),
      btrim(p_activity->>'slug'),
      nullif(btrim(p_activity->>'short_description'), ''),
      btrim(p_activity->>'description'),
      nullif(btrim(p_activity->>'objective'), ''),
      nullif(btrim(p_activity->>'target_audience'), ''),
      (p_activity->>'modality')::public.activity_modality,
      nullif(btrim(p_activity->>'virtual_url'), ''),
      nullif(btrim(p_activity->>'duration_text'), ''),
      nullif(p_activity->>'academic_hours', '')::numeric,
      nullif(btrim(p_activity->>'program'), ''),
      nullif(btrim(p_activity->>'syllabus'), ''),
      nullif(btrim(p_activity->>'banner_path'), ''),
      coalesce((p_activity->>'is_free')::boolean, false),
      coalesce(nullif(p_activity->>'general_price', '')::numeric, 0),
      coalesce(nullif(p_activity->>'member_price', '')::numeric, 0),
      coalesce((p_activity->>'members_only')::boolean, false),
      nullif(p_activity->>'capacity', '')::integer,
      coalesce(nullif(p_activity->>'certificate_mode', ''), 'none'),
      coalesce(nullif(p_activity->>'certificate_general_price', '')::numeric, 0),
      coalesce(nullif(p_activity->>'certificate_member_price', '')::numeric, 0),
      nullif(p_activity->>'registration_open_at', '')::timestamptz,
      nullif(p_activity->>'registration_close_at', '')::timestamptz,
      coalesce((p_activity->>'registrations_closed_manually')::boolean, false),
      nullif(btrim(p_activity->>'additional_info'), ''),
      v_status,
      case when v_status = 'published' then now() else null end,
      (select auth.uid()),
      (select auth.uid())
    );
  else
    update public.activities
    set
      category_id = nullif(p_activity->>'category_id', '')::uuid,
      venue_id = nullif(p_activity->>'venue_id', '')::uuid,
      contact_id = nullif(p_activity->>'contact_id', '')::uuid,
      type = (p_activity->>'type')::public.activity_type,
      title = btrim(p_activity->>'title'),
      slug = btrim(p_activity->>'slug'),
      short_description = nullif(btrim(p_activity->>'short_description'), ''),
      description = btrim(p_activity->>'description'),
      objective = nullif(btrim(p_activity->>'objective'), ''),
      target_audience = nullif(btrim(p_activity->>'target_audience'), ''),
      modality = (p_activity->>'modality')::public.activity_modality,
      virtual_url = nullif(btrim(p_activity->>'virtual_url'), ''),
      duration_text = nullif(btrim(p_activity->>'duration_text'), ''),
      academic_hours = nullif(p_activity->>'academic_hours', '')::numeric,
      program = nullif(btrim(p_activity->>'program'), ''),
      syllabus = nullif(btrim(p_activity->>'syllabus'), ''),
      banner_path = coalesce(nullif(btrim(p_activity->>'banner_path'), ''), activities.banner_path),
      is_free = coalesce((p_activity->>'is_free')::boolean, false),
      general_price = coalesce(nullif(p_activity->>'general_price', '')::numeric, 0),
      member_price = coalesce(nullif(p_activity->>'member_price', '')::numeric, 0),
      members_only = coalesce((p_activity->>'members_only')::boolean, false),
      capacity = nullif(p_activity->>'capacity', '')::integer,
      certificate_mode = coalesce(nullif(p_activity->>'certificate_mode', ''), 'none'),
      certificate_general_price = coalesce(nullif(p_activity->>'certificate_general_price', '')::numeric, 0),
      certificate_member_price = coalesce(nullif(p_activity->>'certificate_member_price', '')::numeric, 0),
      registration_open_at = nullif(p_activity->>'registration_open_at', '')::timestamptz,
      registration_close_at = nullif(p_activity->>'registration_close_at', '')::timestamptz,
      registrations_closed_manually = coalesce((p_activity->>'registrations_closed_manually')::boolean, false),
      additional_info = nullif(btrim(p_activity->>'additional_info'), ''),
      status = v_status,
      published_at = case when v_status = 'published' then coalesce(activities.published_at, now()) else activities.published_at end,
      updated_by = (select auth.uid())
    where id = v_activity_id and deleted_at is null;

    if not found then
      raise exception 'La actividad no existe o fue eliminada.' using errcode = 'P0002';
    end if;

    update public.activity_dates set deleted_at = now(), deleted_by = (select auth.uid())
    where activity_id = v_activity_id and deleted_at is null;
    update public.activity_speakers set deleted_at = now(), deleted_by = (select auth.uid())
    where activity_id = v_activity_id and deleted_at is null;
  end if;

  for v_date in select value from jsonb_array_elements(p_dates)
  loop
    insert into public.activity_dates (activity_id, starts_at, ends_at, label, sort_order)
    values (
      v_activity_id,
      (v_date->>'starts_at')::timestamptz,
      nullif(v_date->>'ends_at', '')::timestamptz,
      nullif(btrim(v_date->>'label'), ''),
      coalesce((v_date->>'sort_order')::integer, 0)
    );
  end loop;

  if jsonb_typeof(p_speakers) = 'array' then
    for v_speaker in select value from jsonb_array_elements(p_speakers)
    loop
      insert into public.activity_speakers (activity_id, speaker_id, role_label, sort_order)
      values (
        v_activity_id,
        (v_speaker->>'speaker_id')::uuid,
        nullif(btrim(v_speaker->>'role_label'), ''),
        coalesce((v_speaker->>'sort_order')::integer, 0)
      );
    end loop;
  end if;

  return v_activity_id;
end;
$$;

alter table public.registrations
  add column certificate_mode_snapshot text not null default 'none',
  add column certificate_price_snapshot numeric(10, 2),
  add column certificate_request_token uuid not null default extensions.gen_random_uuid(),
  add column certificate_requested_at timestamptz,
  add column certificate_followed_up_at timestamptz,
  add column certificate_followed_up_by uuid references auth.users(id) on delete set null;

alter table public.registrations
  add constraint registrations_certificate_mode_valid check (
    certificate_mode_snapshot in ('none', 'included', 'optional_paid')
  ),
  add constraint registrations_certificate_price_matches_mode check (
    (
      certificate_mode_snapshot in ('none', 'included')
      and certificate_price_snapshot is null
    )
    or (
      certificate_mode_snapshot = 'optional_paid'
      and certificate_price_snapshot > 0
    )
  ),
  add constraint registrations_certificate_request_mode check (
    certificate_requested_at is null
    or certificate_mode_snapshot = 'optional_paid'
  ),
  add constraint registrations_certificate_follow_up_consistency check (
    (
      certificate_followed_up_at is null
      and certificate_followed_up_by is null
    )
    or (
      certificate_requested_at is not null
      and certificate_followed_up_at is not null
      and certificate_followed_up_by is not null
    )
  );

create unique index uq_registrations_certificate_request_token
on public.registrations(certificate_request_token);

create index idx_registrations_certificate_follow_up_pending
on public.registrations(activity_id, certificate_requested_at)
where deleted_at is null
  and certificate_requested_at is not null
  and certificate_followed_up_at is null;

create or replace function public.snapshot_activity_certificate_offer()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_activity public.activities%rowtype;
begin
  select * into strict v_activity
  from public.activities
  where id = new.activity_id;

  new.certificate_mode_snapshot := v_activity.certificate_mode;
  new.certificate_price_snapshot := case
    when v_activity.certificate_mode <> 'optional_paid' then null
    when new.registration_type = 'member' then v_activity.certificate_member_price
    else v_activity.certificate_general_price
  end;

  return new;
end;
$$;

create trigger snapshot_activity_certificate_offer_before_insert
before insert on public.registrations
for each row execute function public.snapshot_activity_certificate_offer();

create or replace function public.audit_activity_certificate_configuration()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_backfilled integer := 0;
  v_changed boolean := false;
begin
  if tg_op = 'INSERT' then
    v_changed := new.certificate_mode <> 'none';
  else
    v_changed := row(
      old.certificate_mode,
      old.certificate_general_price,
      old.certificate_member_price
    ) is distinct from row(
      new.certificate_mode,
      new.certificate_general_price,
      new.certificate_member_price
    );

    if old.certificate_mode = 'none'
      and new.certificate_mode in ('included', 'optional_paid')
    then
      update public.registrations registration
      set
        certificate_mode_snapshot = new.certificate_mode,
        certificate_price_snapshot = case
          when new.certificate_mode = 'included' then null
          when registration.registration_type = 'member' then new.certificate_member_price
          else new.certificate_general_price
        end
      where registration.activity_id = new.id
        and registration.deleted_at is null
        and registration.certificate_mode_snapshot = 'none'
        and registration.certificate_requested_at is null;
      get diagnostics v_backfilled = row_count;
    end if;
  end if;

  if v_changed then
    insert into public.audit_logs (
      actor_user_id,
      action,
      entity_type,
      entity_id,
      old_data,
      new_data,
      metadata
    ) values (
      auth.uid(),
      'activity.certificate_configuration_changed',
      'activity',
      new.id,
      case when tg_op = 'UPDATE' then jsonb_build_object(
        'certificate_mode', old.certificate_mode,
        'certificate_general_price', old.certificate_general_price,
        'certificate_member_price', old.certificate_member_price
      ) else null end,
      jsonb_build_object(
        'certificate_mode', new.certificate_mode,
        'certificate_general_price', new.certificate_general_price,
        'certificate_member_price', new.certificate_member_price
      ),
      jsonb_build_object('backfilled_registrations', v_backfilled)
    );
  end if;

  return new;
end;
$$;

create trigger audit_activity_certificate_configuration_after_insert
after insert on public.activities
for each row execute function public.audit_activity_certificate_configuration();

create trigger audit_activity_certificate_configuration_after_update
after update of certificate_mode, certificate_general_price, certificate_member_price
on public.activities
for each row execute function public.audit_activity_certificate_configuration();

create or replace function public.enrich_activity_certificate_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_context record;
begin
  if new.related_entity_type <> 'registration'
    or new.related_entity_id is null
  then
    return new;
  end if;

  select
    activity.certificate_mode as current_certificate_mode,
    coalesce(contact.email, activity.contact_email) as contact_email,
    coalesce(contact.contact_name, activity.contact_name) as contact_name,
    coalesce(contact.whatsapp_phone, activity.contact_phone) as contact_phone,
    registration.certificate_mode_snapshot,
    registration.certificate_price_snapshot,
    registration.certificate_request_token,
    registration.registration_type
  into v_context
  from public.registrations registration
  join public.activities activity on activity.id = registration.activity_id
  left join public.activity_contacts contact
    on contact.id = activity.contact_id and contact.deleted_at is null
  where registration.id = new.related_entity_id;

  if not found then
    return new;
  end if;

  new.payload := coalesce(new.payload, '{}'::jsonb) || jsonb_strip_nulls(
    jsonb_build_object(
      'certificate_mode', case
        when v_context.current_certificate_mode = 'none' then 'none'
        when v_context.current_certificate_mode = 'included' then 'included'
        else v_context.certificate_mode_snapshot
      end,
      'certificate_price', case
        when v_context.current_certificate_mode = 'optional_paid'
          then v_context.certificate_price_snapshot
        else null
      end,
      'certificate_request_token', v_context.certificate_request_token,
      'contact_email', v_context.contact_email,
      'contact_name', v_context.contact_name,
      'contact_whatsapp_phone', v_context.contact_phone,
      'registration_type', v_context.registration_type
    )
  );

  return new;
end;
$$;

create trigger enrich_activity_certificate_notification_before_insert
before insert on public.notification_outbox
for each row execute function public.enrich_activity_certificate_notification();

create or replace function public.enqueue_activity_certificate_offer()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_context record;
begin
  if old.status = 'attended' or new.status <> 'attended' then
    return new;
  end if;

  select
    activity.id as activity_id,
    activity.slug,
    activity.title,
    activity.type,
    people.email,
    registration.id as registration_id,
    registration.person_id,
    registration.registration_code
  into v_context
  from public.registrations registration
  join public.activities activity on activity.id = registration.activity_id
  join public.people people on people.id = registration.person_id
  where registration.id = new.registration_id
    and registration.deleted_at is null
    and registration.status = 'confirmed'
    and registration.certificate_mode_snapshot = 'optional_paid'
    and registration.certificate_price_snapshot > 0
    and registration.certificate_requested_at is null
    and activity.deleted_at is null
    and activity.certificate_mode = 'optional_paid'
    and activity.status in ('published', 'finished');

  if not found then
    return new;
  end if;

  insert into public.notification_outbox (
    person_id,
    event_type,
    recipient_email,
    related_entity_type,
    related_entity_id,
    payload
  ) values (
    v_context.person_id,
    'activity_certificate_offer',
    v_context.email,
    'registration',
    v_context.registration_id,
    jsonb_build_object(
      'activity_id', v_context.activity_id,
      'activity_slug', v_context.slug,
      'activity_title', v_context.title,
      'activity_type', v_context.type,
      'registration_code', v_context.registration_code
    )
  ) on conflict (event_type, related_entity_type, related_entity_id)
    where deleted_at is null and related_entity_id is not null
  do nothing;

  return new;
end;
$$;

create trigger enqueue_activity_certificate_offer_after_attendance
after update of status on public.attendance
for each row execute function public.enqueue_activity_certificate_offer();

create or replace function public.register_activity(
  p_activity_id uuid,
  p_registration jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_activity_ends_at timestamptz;
  v_person_id uuid;
  v_result jsonb;
begin
  select max(coalesce(activity_dates.ends_at, activity_dates.starts_at))
  into v_activity_ends_at
  from public.activity_dates
  where activity_dates.activity_id = p_activity_id
    and activity_dates.deleted_at is null;

  if v_activity_ends_at is not null and now() >= v_activity_ends_at then
    raise exception 'REGISTRATION_CLOSED' using errcode = 'P0001';
  end if;

  select id into v_person_id
  from public.people
  where document_type::text = lower(btrim(p_registration->>'document_type'))
    and document_number = upper(btrim(p_registration->>'document_number'));

  if v_person_id is not null and exists (
    select 1 from public.registrations
    where activity_id = p_activity_id
      and person_id = v_person_id
      and deleted_at is null
  ) then
    raise exception 'DUPLICATE_REGISTRATION' using errcode = '23505';
  end if;

  v_result := public.register_activity_internal(p_activity_id, p_registration);

  return v_result || (
    select jsonb_build_object(
      'certificate_mode', registration.certificate_mode_snapshot,
      'certificate_price', registration.certificate_price_snapshot,
      'certificate_request_token', registration.certificate_request_token
    )
    from public.registrations registration
    where registration.id = (v_result->>'registration_id')::uuid
  );
end;
$$;

revoke execute on function public.register_activity(uuid, jsonb) from public;
grant execute on function public.register_activity(uuid, jsonb) to anon, authenticated, service_role;

create or replace function public.get_public_registration_result(p_registration_code text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'activity_slug', activity.slug,
    'activity_title', activity.title,
    'activity_type', activity.type,
    'certificate_mode', case
      when activity.certificate_mode = 'none' then 'none'
      when activity.certificate_mode = 'included' then 'included'
      else registration.certificate_mode_snapshot
    end,
    'certificate_price', case
      when activity.certificate_mode = 'optional_paid' then registration.certificate_price_snapshot
      else null
    end,
    'certificate_request_token', null,
    'certificate_requested_at', null,
    'contact_email', activity.contact_email,
    'contact_name', activity.contact_name,
    'contact_phone', activity.contact_phone,
    'is_free', activity.is_free,
    'price_snapshot', registration.price_snapshot,
    'registration_code', registration.registration_code,
    'registration_type', registration.registration_type,
    'status', registration.status
  )
  from public.registrations registration
  join public.activities activity on activity.id = registration.activity_id
  where registration.registration_code = upper(btrim(p_registration_code))
    and registration.deleted_at is null
    and activity.deleted_at is null
    and activity.status <> 'archived';
$$;

create or replace function public.get_public_registration_result_secure(
  p_registration_code text,
  p_request_token uuid
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'activity_slug', activity.slug,
    'activity_title', activity.title,
    'activity_type', activity.type,
    'certificate_mode', case
      when activity.certificate_mode = 'none' then 'none'
      when activity.certificate_mode = 'included' then 'included'
      else registration.certificate_mode_snapshot
    end,
    'certificate_price', case
      when activity.certificate_mode = 'optional_paid' then registration.certificate_price_snapshot
      else null
    end,
    'certificate_request_token', registration.certificate_request_token,
    'certificate_requested_at', registration.certificate_requested_at,
    'contact_email', activity.contact_email,
    'contact_name', activity.contact_name,
    'contact_phone', activity.contact_phone,
    'is_free', activity.is_free,
    'price_snapshot', registration.price_snapshot,
    'registration_code', registration.registration_code,
    'registration_type', registration.registration_type,
    'status', registration.status
  )
  from public.registrations registration
  join public.activities activity on activity.id = registration.activity_id
  where registration.registration_code = upper(btrim(p_registration_code))
    and registration.certificate_request_token = p_request_token
    and registration.deleted_at is null
    and activity.deleted_at is null
    and activity.status <> 'archived';
$$;

revoke execute on function public.get_public_registration_result_secure(text, uuid) from public;
grant execute on function public.get_public_registration_result_secure(text, uuid)
to anon, authenticated, service_role;

create or replace function public.request_activity_certificate(
  p_registration_code text,
  p_request_token uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_notification_id uuid;
  v_old public.registrations%rowtype;
  v_registration public.registrations%rowtype;
  v_context record;
begin
  select * into v_old
  from public.registrations registration
  where registration.registration_code = upper(btrim(p_registration_code))
    and registration.certificate_request_token = p_request_token
    and registration.deleted_at is null
  for update;

  if not found then
    raise exception 'CERTIFICATE_REQUEST_NOT_FOUND' using errcode = 'P0001';
  end if;

  select
    activity.certificate_mode,
    coalesce(contact.email, activity.contact_email) as contact_email,
    coalesce(contact.contact_name, activity.contact_name) as contact_name,
    coalesce(contact.whatsapp_phone, activity.contact_phone) as contact_phone,
    activity.deleted_at as activity_deleted_at,
    activity.id as activity_id,
    activity.slug as activity_slug,
    activity.status as activity_status,
    activity.title as activity_title,
    activity.type as activity_type,
    people.email as participant_email,
    people.first_names,
    people.last_names,
    people.phone as participant_phone
  into strict v_context
  from public.activities activity
  left join public.activity_contacts contact
    on contact.id = activity.contact_id and contact.deleted_at is null
  join public.people people on people.id = v_old.person_id
  where activity.id = v_old.activity_id;

  if v_old.status <> 'confirmed'
    or v_old.certificate_mode_snapshot <> 'optional_paid'
    or v_old.certificate_price_snapshot is null
    or v_old.certificate_price_snapshot <= 0
    or v_context.certificate_mode <> 'optional_paid'
    or v_context.activity_deleted_at is not null
    or v_context.activity_status not in ('published', 'finished')
  then
    raise exception 'CERTIFICATE_REQUEST_NOT_AVAILABLE' using errcode = 'P0001';
  end if;

  if nullif(btrim(v_context.contact_phone), '') is null then
    raise exception 'CERTIFICATE_CONTACT_NOT_AVAILABLE' using errcode = 'P0001';
  end if;

  update public.registrations
  set certificate_requested_at = coalesce(certificate_requested_at, now())
  where id = v_old.id
  returning * into v_registration;

  if v_context.contact_email is not null then
    insert into public.notification_outbox (
      person_id,
      event_type,
      recipient_email,
      related_entity_type,
      related_entity_id,
      payload
    ) values (
      v_registration.person_id,
      'activity_certificate_request_created',
      v_context.contact_email,
      'registration',
      v_registration.id,
      jsonb_build_object(
        'activity_id', v_context.activity_id,
        'activity_slug', v_context.activity_slug,
        'activity_title', v_context.activity_title,
        'activity_type', v_context.activity_type,
        'participant_name', concat_ws(' ', v_context.first_names, v_context.last_names),
        'participant_phone', v_context.participant_phone,
        'registration_id', v_registration.id,
        'registration_code', v_registration.registration_code,
        'responsible_email', v_context.contact_email,
        'requested_at', v_registration.certificate_requested_at
      )
    ) on conflict (event_type, related_entity_type, related_entity_id)
      where deleted_at is null and related_entity_id is not null
    do nothing
    returning id into v_notification_id;
  end if;

  if v_old.certificate_requested_at is null then
    insert into public.audit_logs (
      actor_user_id, action, entity_type, entity_id, old_data, new_data
    ) values (
      null,
      'registration.certificate_requested',
      'registration',
      v_registration.id,
      jsonb_build_object('certificate_requested_at', v_old.certificate_requested_at),
      jsonb_build_object('certificate_requested_at', v_registration.certificate_requested_at)
    );
  end if;

  return jsonb_build_object(
    'activity_title', v_context.activity_title,
    'certificate_price', v_registration.certificate_price_snapshot,
    'contact_whatsapp_phone', v_context.contact_phone,
    'notification_id', v_notification_id,
    'registration_code', v_registration.registration_code,
    'registration_type', v_registration.registration_type,
    'requested_at', v_registration.certificate_requested_at
  );
end;
$$;

revoke execute on function public.request_activity_certificate(text, uuid) from public;
grant execute on function public.request_activity_certificate(text, uuid)
to anon, authenticated, service_role;

create or replace function public.mark_certificate_request_followed_up(
  p_registration_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_new public.registrations%rowtype;
  v_old public.registrations%rowtype;
begin
  if not public.is_active_admin() then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;

  select * into v_old
  from public.registrations
  where id = p_registration_id and deleted_at is null
  for update;

  if not found then
    raise exception 'REGISTRATION_NOT_FOUND' using errcode = 'P0001';
  end if;

  if v_old.certificate_requested_at is null then
    raise exception 'CERTIFICATE_REQUEST_NOT_FOUND' using errcode = 'P0001';
  end if;

  if v_old.certificate_followed_up_at is not null then
    return jsonb_build_object('changed', false, 'registration_id', v_old.id);
  end if;

  update public.registrations
  set
    certificate_followed_up_at = now(),
    certificate_followed_up_by = auth.uid()
  where id = v_old.id
  returning * into v_new;

  insert into public.audit_logs (
    actor_user_id, action, entity_type, entity_id, old_data, new_data
  ) values (
    auth.uid(),
    'registration.certificate_followed_up',
    'registration',
    v_new.id,
    to_jsonb(v_old),
    to_jsonb(v_new)
  );

  return jsonb_build_object('changed', true, 'registration_id', v_new.id);
end;
$$;

revoke execute on function public.mark_certificate_request_followed_up(uuid) from public, anon;
grant execute on function public.mark_certificate_request_followed_up(uuid)
to authenticated, service_role;

revoke execute on function public.snapshot_activity_certificate_offer() from public, anon, authenticated;
revoke execute on function public.audit_activity_certificate_configuration() from public, anon, authenticated;
revoke execute on function public.enrich_activity_certificate_notification() from public, anon, authenticated;
revoke execute on function public.enqueue_activity_certificate_offer() from public, anon, authenticated;

comment on column public.activities.certificate_mode is
  'none, included or optional_paid; only optional_paid uses manual commercial follow-up.';
comment on column public.registrations.certificate_mode_snapshot is
  'Historical certificate modality offered to this registration.';
comment on function public.request_activity_certificate(text, uuid) is
  'Records an optional paid certificate request before returning its WhatsApp context.';
comment on function public.mark_certificate_request_followed_up(uuid) is
  'Marks that an internal operator contacted or attended a certificate requester.';
