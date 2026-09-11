-- Track manual certificate requests and externally verified payments without
-- turning the certificate module into a payment ledger.

alter table public.registrations
  add column certificate_requested_by uuid references auth.users(id) on delete set null,
  add column certificate_payment_verified_at timestamptz,
  add column certificate_payment_verified_by uuid references auth.users(id) on delete set null;

alter table public.registrations
  add constraint registrations_certificate_requested_by_consistency check (
    certificate_requested_by is null or certificate_requested_at is not null
  ),
  add constraint registrations_certificate_payment_consistency check (
    (
      certificate_payment_verified_at is null
      and certificate_payment_verified_by is null
    )
    or (
      certificate_mode_snapshot = 'optional_paid'
      and certificate_requested_at is not null
      and certificate_payment_verified_at is not null
      and certificate_payment_verified_by is not null
    )
  );

-- "Followed up" never represented a verified payment. Reset the deprecated
-- marker and retain its columns only for compatibility with the live release.
update public.registrations
set certificate_followed_up_at = null,
    certificate_followed_up_by = null
where certificate_followed_up_at is not null
   or certificate_followed_up_by is not null;

drop index if exists public.idx_registrations_certificate_follow_up_pending;

create index idx_registrations_certificate_payment_pending
on public.registrations(activity_id, certificate_requested_at)
where deleted_at is null
  and certificate_mode_snapshot = 'optional_paid'
  and certificate_requested_at is not null
  and certificate_payment_verified_at is null;

create index idx_registrations_certificate_payment_verified
on public.registrations(activity_id, certificate_payment_verified_at)
where deleted_at is null
  and certificate_mode_snapshot = 'optional_paid'
  and certificate_payment_verified_at is not null;

create or replace function public.register_activity_certificate_request_admin(
  p_registration_id uuid
)
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

  select * into v_old
  from public.registrations
  where id = p_registration_id and deleted_at is null
  for update;

  if not found then
    raise exception 'REGISTRATION_NOT_FOUND' using errcode = 'P0001';
  end if;

  select * into v_activity
  from public.activities
  where id = v_old.activity_id and deleted_at is null;

  if not found or v_activity.status not in ('published', 'finished') then
    raise exception 'ACTIVITY_NOT_AVAILABLE' using errcode = 'P0001';
  end if;

  if v_old.status = 'cancelled' then
    raise exception 'REGISTRATION_CANCELLED' using errcode = 'P0001';
  end if;

  if v_old.certificate_mode_snapshot <> 'optional_paid'
    or v_old.certificate_price_snapshot is null
    or v_old.certificate_price_snapshot <= 0
    or v_activity.certificate_mode <> 'optional_paid'
  then
    raise exception 'CERTIFICATE_REQUEST_NOT_AVAILABLE' using errcode = 'P0001';
  end if;

  if v_old.certificate_requested_at is not null then
    return jsonb_build_object(
      'changed', false,
      'registration_id', v_old.id,
      'requested_at', v_old.certificate_requested_at
    );
  end if;

  update public.registrations
  set
    certificate_requested_at = now(),
    certificate_requested_by = auth.uid(),
    certificate_followed_up_at = null,
    certificate_followed_up_by = null
  where id = v_old.id
  returning * into v_new;

  insert into public.audit_logs (
    actor_user_id, action, entity_type, entity_id, old_data, new_data, metadata
  ) values (
    auth.uid(),
    'registration.certificate_requested',
    'registration',
    v_new.id,
    jsonb_build_object(
      'certificate_requested_at', v_old.certificate_requested_at,
      'certificate_requested_by', v_old.certificate_requested_by,
      'commercial_status', 'not_requested'
    ),
    jsonb_build_object(
      'certificate_requested_at', v_new.certificate_requested_at,
      'certificate_requested_by', v_new.certificate_requested_by,
      'commercial_status', 'payment_pending'
    ),
    jsonb_build_object('source', 'admin_manual')
  );

  return jsonb_build_object(
    'changed', true,
    'registration_id', v_new.id,
    'requested_at', v_new.certificate_requested_at
  );
end;
$$;

create or replace function public.verify_activity_certificate_payment(
  p_registration_id uuid
)
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

  select * into v_old
  from public.registrations
  where id = p_registration_id and deleted_at is null
  for update;

  if not found then
    raise exception 'REGISTRATION_NOT_FOUND' using errcode = 'P0001';
  end if;

  select * into v_activity
  from public.activities
  where id = v_old.activity_id and deleted_at is null;

  if not found or v_activity.status not in ('published', 'finished') then
    raise exception 'ACTIVITY_NOT_AVAILABLE' using errcode = 'P0001';
  end if;

  if v_old.status <> 'confirmed' then
    raise exception 'REGISTRATION_NOT_CONFIRMED' using errcode = 'P0001';
  end if;

  if v_old.certificate_mode_snapshot <> 'optional_paid'
    or v_activity.certificate_mode <> 'optional_paid'
  then
    raise exception 'CERTIFICATE_PAYMENT_NOT_AVAILABLE' using errcode = 'P0001';
  end if;

  if v_old.certificate_requested_at is null then
    raise exception 'CERTIFICATE_REQUEST_NOT_FOUND' using errcode = 'P0001';
  end if;

  if v_old.certificate_payment_verified_at is not null then
    return jsonb_build_object(
      'changed', false,
      'registration_id', v_old.id,
      'verified_at', v_old.certificate_payment_verified_at
    );
  end if;

  update public.registrations
  set
    certificate_payment_verified_at = now(),
    certificate_payment_verified_by = auth.uid()
  where id = v_old.id
  returning * into v_new;

  insert into public.audit_logs (
    actor_user_id, action, entity_type, entity_id, old_data, new_data
  ) values (
    auth.uid(),
    'registration.certificate_payment_verified',
    'registration',
    v_new.id,
    jsonb_build_object(
      'certificate_payment_verified_at', v_old.certificate_payment_verified_at,
      'certificate_payment_verified_by', v_old.certificate_payment_verified_by,
      'commercial_status', 'payment_pending'
    ),
    jsonb_build_object(
      'certificate_payment_verified_at', v_new.certificate_payment_verified_at,
      'certificate_payment_verified_by', v_new.certificate_payment_verified_by,
      'commercial_status', case
        when exists (
          select 1 from public.attendance
          where registration_id = v_new.id
            and status = 'attended'
            and deleted_at is null
        ) then 'ready_to_issue'
        else 'payment_verified_pending_attendance'
      end
    )
  );

  return jsonb_build_object(
    'changed', true,
    'registration_id', v_new.id,
    'verified_at', v_new.certificate_payment_verified_at
  );
end;
$$;

create or replace function public.revert_activity_certificate_payment(
  p_registration_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_activity public.activities%rowtype;
  v_new public.registrations%rowtype;
  v_old public.registrations%rowtype;
  v_reason text := nullif(btrim(p_reason), '');
begin
  if not public.is_active_admin() then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;

  if v_reason is null or length(v_reason) < 3 or length(v_reason) > 500 then
    raise exception 'INVALID_REVERSAL_REASON' using errcode = '22023';
  end if;

  select * into v_old
  from public.registrations
  where id = p_registration_id and deleted_at is null
  for update;

  if not found then
    raise exception 'REGISTRATION_NOT_FOUND' using errcode = 'P0001';
  end if;

  select * into v_activity
  from public.activities
  where id = v_old.activity_id and deleted_at is null;

  if not found or v_activity.status not in ('published', 'finished') then
    raise exception 'ACTIVITY_NOT_AVAILABLE' using errcode = 'P0001';
  end if;

  if v_old.status = 'cancelled' then
    raise exception 'REGISTRATION_CANCELLED' using errcode = 'P0001';
  end if;

  if v_old.certificate_mode_snapshot <> 'optional_paid'
    or v_activity.certificate_mode <> 'optional_paid'
  then
    raise exception 'CERTIFICATE_PAYMENT_NOT_AVAILABLE' using errcode = 'P0001';
  end if;

  if exists (
    select 1
    from public.certificates
    where registration_id = v_old.id
      and certificate_type = 'activity'
      and deleted_at is null
  ) then
    raise exception 'CERTIFICATE_ALREADY_ISSUED' using errcode = 'P0001';
  end if;

  if v_old.certificate_payment_verified_at is null then
    return jsonb_build_object('changed', false, 'registration_id', v_old.id);
  end if;

  update public.registrations
  set
    certificate_payment_verified_at = null,
    certificate_payment_verified_by = null
  where id = v_old.id
  returning * into v_new;

  insert into public.audit_logs (
    actor_user_id, action, entity_type, entity_id, old_data, new_data, metadata
  ) values (
    auth.uid(),
    'registration.certificate_payment_reverted',
    'registration',
    v_new.id,
    jsonb_build_object(
      'certificate_payment_verified_at', v_old.certificate_payment_verified_at,
      'certificate_payment_verified_by', v_old.certificate_payment_verified_by,
      'commercial_status', case
        when exists (
          select 1 from public.attendance
          where registration_id = v_old.id
            and status = 'attended'
            and deleted_at is null
        ) then 'ready_to_issue'
        else 'payment_verified_pending_attendance'
      end
    ),
    jsonb_build_object(
      'certificate_payment_verified_at', v_new.certificate_payment_verified_at,
      'certificate_payment_verified_by', v_new.certificate_payment_verified_by,
      'commercial_status', 'payment_pending'
    ),
    jsonb_build_object('reason', v_reason)
  );

  return jsonb_build_object('changed', true, 'registration_id', v_new.id);
end;
$$;

revoke all on function public.register_activity_certificate_request_admin(uuid) from public, anon;
revoke all on function public.verify_activity_certificate_payment(uuid) from public, anon;
revoke all on function public.revert_activity_certificate_payment(uuid, text) from public, anon;

grant execute on function public.register_activity_certificate_request_admin(uuid) to authenticated, service_role;
grant execute on function public.verify_activity_certificate_payment(uuid) to authenticated, service_role;
grant execute on function public.revert_activity_certificate_payment(uuid, text) to authenticated, service_role;

-- Disable the ambiguous legacy action while retaining the function during the
-- compatibility window.
revoke execute on function public.mark_certificate_request_followed_up(uuid) from authenticated, service_role;

drop function public.get_activity_certificate_candidates(uuid, text, integer, integer);

create function public.get_activity_certificate_candidates(
  p_activity_id uuid,
  p_query text default null,
  p_limit integer default 20,
  p_offset integer default 0
)
returns table (
  registration_id uuid,
  registration_code text,
  registration_status public.registration_status,
  company_snapshot text,
  person_id uuid,
  document_number text,
  email text,
  first_names text,
  last_names text,
  attendance_status public.attendance_status,
  certificate_mode_snapshot text,
  certificate_price_snapshot numeric,
  certificate_requested_at timestamptz,
  certificate_requested_by uuid,
  certificate_payment_verified_at timestamptz,
  certificate_payment_verified_by uuid,
  certificate_id uuid,
  certificate_code text,
  certificate_status public.certificate_status,
  file_path text,
  total_count bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_internal_user() then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;
  if p_activity_id is null or p_limit is null or p_limit < 1 or p_limit > 100
    or p_offset is null or p_offset < 0
  then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  return query
  select
    registration.id,
    registration.registration_code::text,
    registration.status,
    registration.company_snapshot,
    person.id,
    person.document_number::text,
    person.email::text,
    person.first_names::text,
    person.last_names::text,
    attendance.status,
    registration.certificate_mode_snapshot,
    registration.certificate_price_snapshot,
    registration.certificate_requested_at,
    registration.certificate_requested_by,
    registration.certificate_payment_verified_at,
    registration.certificate_payment_verified_by,
    certificate.id,
    certificate.certificate_code::text,
    certificate.status,
    certificate.file_path,
    count(*) over()
  from public.registrations registration
  join public.activities activity
    on activity.id = registration.activity_id
    and activity.deleted_at is null
    and activity.status <> 'archived'
  join public.people person on person.id = registration.person_id and person.deleted_at is null
  join public.attendance attendance
    on attendance.registration_id = registration.id and attendance.deleted_at is null
  left join public.certificates certificate
    on certificate.registration_id = registration.id
    and certificate.certificate_type = 'activity'
    and certificate.deleted_at is null
  where registration.activity_id = p_activity_id
    and registration.deleted_at is null
    and (
      nullif(btrim(p_query), '') is null
      or person.document_number ilike concat('%', btrim(p_query), '%')
      or person.email ilike concat('%', btrim(p_query), '%')
      or ((person.first_names || ' ') || person.last_names) ilike concat('%', btrim(p_query), '%')
      or registration.registration_code ilike concat('%', btrim(p_query), '%')
    )
  order by registration.created_at desc
  limit p_limit offset p_offset;
end;
$$;

revoke all on function public.get_activity_certificate_candidates(uuid, text, integer, integer) from public, anon;
grant execute on function public.get_activity_certificate_candidates(uuid, text, integer, integer) to authenticated, service_role;

create or replace function public.get_certificate_activity_summaries(
  p_query text default null,
  p_type public.activity_type default null,
  p_limit integer default 12,
  p_offset integer default 0
)
returns table (
  id uuid,
  title text,
  type public.activity_type,
  eligible_count bigint,
  issued_count bigint,
  total_count bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_internal_user() then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;
  if p_limit is null or p_limit < 1 or p_limit > 50 or p_offset is null or p_offset < 0 then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  return query
  with summaries as (
    select
      activity.id,
      activity.title::text,
      activity.type,
      activity.updated_at,
      count(distinct registration.id) filter (
        where registration.status = 'confirmed'
          and attendance.status = 'attended'
          and certificate.id is null
          and (
            activity.certificate_mode = 'included'
            or registration.certificate_mode_snapshot = 'included'
            or (
              activity.certificate_mode = 'optional_paid'
              and registration.certificate_mode_snapshot = 'optional_paid'
              and registration.certificate_requested_at is not null
              and registration.certificate_payment_verified_at is not null
            )
          )
          and activity.certificate_mode <> 'none'
      ) as eligible_count,
      count(distinct certificate.id) as issued_count
    from public.activities activity
    left join public.registrations registration
      on registration.activity_id = activity.id and registration.deleted_at is null
    left join public.attendance attendance
      on attendance.registration_id = registration.id and attendance.deleted_at is null
    left join public.certificates certificate
      on certificate.registration_id = registration.id
      and certificate.certificate_type = 'activity'
      and certificate.deleted_at is null
    where activity.deleted_at is null
      and activity.status <> 'archived'
      and (p_type is null or activity.type = p_type)
      and (
        nullif(btrim(p_query), '') is null
        or activity.title ilike concat('%', btrim(p_query), '%')
      )
    group by activity.id, activity.title, activity.type, activity.updated_at
  )
  select summaries.id, summaries.title, summaries.type, summaries.eligible_count,
    summaries.issued_count, count(*) over() as total_count
  from summaries
  order by summaries.updated_at desc
  limit p_limit offset p_offset;
end;
$$;

revoke all on function public.get_certificate_activity_summaries(text, public.activity_type, integer, integer) from public, anon;
grant execute on function public.get_certificate_activity_summaries(text, public.activity_type, integer, integer) to authenticated, service_role;

comment on column public.registrations.certificate_requested_by is
  'Internal account that manually recorded the certificate request; null for participant-originated requests.';
comment on column public.registrations.certificate_payment_verified_at is
  'When an internal user verified the certificate payment outside the platform.';
comment on function public.register_activity_certificate_request_admin(uuid) is
  'Records a certificate request received by WhatsApp, phone or in person without sending a duplicate notification.';
comment on function public.verify_activity_certificate_payment(uuid) is
  'Records external verification of an optional certificate payment.';
comment on function public.revert_activity_certificate_payment(uuid, text) is
  'Reverts an erroneous certificate payment verification and audits the required reason.';
