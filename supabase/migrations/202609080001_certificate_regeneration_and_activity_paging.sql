drop function if exists public.get_certificate_activity_summaries();

create index if not exists idx_activities_title_trgm_active
  on public.activities using gin (title extensions.gin_trgm_ops)
  where deleted_at is null;

create index if not exists idx_people_full_name_trgm_active
  on public.people using gin (((first_names || ' ') || last_names) extensions.gin_trgm_ops)
  where deleted_at is null;

create index if not exists idx_registrations_code_trgm_active
  on public.registrations using gin (registration_code extensions.gin_trgm_ops)
  where deleted_at is null;

create function public.get_certificate_activity_summaries(
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
      ) as eligible_count,
      count(distinct certificate.id) as issued_count
    from public.activities activity
    left join public.registrations registration
      on registration.activity_id = activity.id
      and registration.deleted_at is null
    left join public.attendance attendance
      on attendance.registration_id = registration.id
      and attendance.deleted_at is null
    left join public.certificates certificate
      on certificate.registration_id = registration.id
      and certificate.certificate_type = 'activity'
      and certificate.deleted_at is null
    where activity.deleted_at is null
      and (p_type is null or activity.type = p_type)
      and (
        nullif(btrim(p_query), '') is null
        or activity.title ilike concat('%', btrim(p_query), '%')
      )
    group by activity.id, activity.title, activity.type, activity.updated_at
  )
  select
    summaries.id,
    summaries.title,
    summaries.type,
    summaries.eligible_count,
    summaries.issued_count,
    count(*) over() as total_count
  from summaries
  order by summaries.updated_at desc
  limit p_limit
  offset p_offset;
end;
$$;

revoke all on function public.get_certificate_activity_summaries(text, public.activity_type, integer, integer)
  from public, anon;
grant execute on function public.get_certificate_activity_summaries(text, public.activity_type, integer, integer)
  to authenticated, service_role;

create function public.replace_certificate_document(
  p_certificate_id uuid,
  p_expected_person_id uuid,
  p_expected_participant_name text,
  p_expected_file_path text,
  p_new_file_path text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_certificate public.certificates%rowtype;
  v_current_name text;
  v_old public.certificates%rowtype;
begin
  if not public.is_active_admin() then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;
  if p_certificate_id is null
    or p_expected_person_id is null
    or nullif(btrim(p_expected_participant_name), '') is null
    or length(btrim(p_expected_participant_name)) > 241
    or nullif(btrim(p_new_file_path), '') is null
    or p_new_file_path !~ ('^issued/' || p_certificate_id::text || '/[A-Za-z0-9-]+[.]pdf$')
  then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  select * into v_certificate
  from public.certificates
  where id = p_certificate_id
    and deleted_at is null
  for update;

  if not found then
    raise exception 'CERTIFICATE_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_certificate.person_id <> p_expected_person_id then
    raise exception 'CERTIFICATE_PERSON_MISMATCH' using errcode = 'P0001';
  end if;
  if v_certificate.status <> 'issued' then
    raise exception 'CERTIFICATE_NOT_ISSUED' using errcode = 'P0001';
  end if;
  select concat_ws(' ', first_names, last_names) into v_current_name
  from public.people
  where id = v_certificate.person_id
    and deleted_at is null;
  if not found then
    raise exception 'PARTICIPANT_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_current_name <> btrim(p_expected_participant_name) then
    raise exception 'PARTICIPANT_NAME_CHANGED' using errcode = '40001';
  end if;
  if v_certificate.file_path is distinct from nullif(btrim(p_expected_file_path), '') then
    raise exception 'CERTIFICATE_FILE_CHANGED' using errcode = '40001';
  end if;

  v_old := v_certificate;
  update public.certificates
  set
    participant_name_snapshot = v_current_name,
    file_path = btrim(p_new_file_path)
  where id = v_certificate.id
  returning * into v_certificate;

  insert into public.audit_logs (
    actor_user_id, action, entity_type, entity_id, old_data, new_data
  ) values (
    auth.uid(), 'certificate.regenerated', 'certificate', v_certificate.id,
    to_jsonb(v_old), to_jsonb(v_certificate)
  );

  return jsonb_build_object(
    'certificate_id', v_certificate.id,
    'old_file_path', v_old.file_path,
    'new_file_path', v_certificate.file_path
  );
end;
$$;

revoke all on function public.replace_certificate_document(uuid, uuid, text, text, text)
  from public, anon;
grant execute on function public.replace_certificate_document(uuid, uuid, text, text, text)
  to authenticated, service_role;

comment on function public.replace_certificate_document(uuid, uuid, text, text, text) is
  'Reemplaza de forma auditada el PDF y el snapshot de nombre de un certificado vigente, conservando su identidad pública.';

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
  if p_activity_id is null
    or p_limit is null or p_limit < 1 or p_limit > 100
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
    certificate.id,
    certificate.certificate_code::text,
    certificate.status,
    certificate.file_path,
    count(*) over()
  from public.registrations registration
  join public.people person
    on person.id = registration.person_id
    and person.deleted_at is null
  join public.attendance attendance
    on attendance.registration_id = registration.id
    and attendance.deleted_at is null
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
  limit p_limit
  offset p_offset;
end;
$$;

revoke all on function public.get_activity_certificate_candidates(uuid, text, integer, integer)
  from public, anon;
grant execute on function public.get_activity_certificate_candidates(uuid, text, integer, integer)
  to authenticated, service_role;
