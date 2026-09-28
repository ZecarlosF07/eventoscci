-- Correct the escaping to exactly one PostgreSQL LIKE escape character.
create or replace function public.admin_literal_pattern(p_query text)
returns text language sql immutable set search_path = '' as $$
  select '%' || replace(replace(replace(btrim(p_query), E'\\', E'\\\\'), '%', E'\\%'), '_', E'\\_') || '%';
$$;

create or replace function public.get_activity_certificate_candidates_filtered(
  p_activity_id uuid,
  p_query text default null,
  p_limit integer default 20,
  p_offset integer default 0,
  p_emission_state text default 'all'
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
  if p_emission_state is null or p_emission_state not in ('all', 'ready', 'issued', 'revoked') then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
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
      p_emission_state = 'all'
      or (p_emission_state = 'issued' and certificate.status = 'issued')
      or (p_emission_state = 'revoked' and certificate.status = 'revoked')
      or (p_emission_state = 'ready' and certificate.id is null
        and registration.status = 'confirmed' and attendance.status = 'attended'
        and activity.certificate_mode <> 'none'
        and (activity.certificate_mode = 'included' or registration.certificate_mode_snapshot = 'included'
          or (registration.certificate_mode_snapshot = 'optional_paid'
            and registration.certificate_requested_at is not null
            and registration.certificate_payment_verified_at is not null)))
    )
    and (
      nullif(btrim(p_query), '') is null
      or person.document_number ilike public.admin_literal_pattern(p_query)
      or person.email ilike public.admin_literal_pattern(p_query)
      or ((person.first_names || ' ') || person.last_names) ilike public.admin_literal_pattern(p_query)
      or registration.registration_code ilike public.admin_literal_pattern(p_query)
    )
  order by registration.created_at desc, registration.id
  limit p_limit offset p_offset;
end;
$$;
revoke all on function public.get_activity_certificate_candidates_filtered(uuid,text,integer,integer,text) from public, anon;
grant execute on function public.get_activity_certificate_candidates_filtered(uuid,text,integer,integer,text) to authenticated, service_role;

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
        or activity.title ilike public.admin_literal_pattern(p_query)
      )
    group by activity.id, activity.title, activity.type, activity.updated_at
  )
  select summaries.id, summaries.title, summaries.type, summaries.eligible_count,
    summaries.issued_count, count(*) over() as total_count
  from summaries
  order by summaries.updated_at desc, summaries.id
  limit p_limit offset p_offset;
end;
$$;

revoke all on function public.get_certificate_activity_summaries(text, public.activity_type, integer, integer) from public, anon;
grant execute on function public.get_certificate_activity_summaries(text, public.activity_type, integer, integer) to authenticated, service_role;
