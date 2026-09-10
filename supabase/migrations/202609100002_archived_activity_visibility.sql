-- Treat archived activities as an operational soft delete while preserving history.

create or replace function public.is_activity_certificate_visible(p_certificate_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((
    select case
      when certificate.certificate_type = 'course' then true
      else exists (
        select 1
        from public.registrations registration
        join public.activities activity on activity.id = registration.activity_id
        where registration.id = certificate.registration_id
          and registration.deleted_at is null
          and activity.deleted_at is null
          and activity.status <> 'archived'
      )
    end
    from public.certificates certificate
    where certificate.id = p_certificate_id
      and certificate.deleted_at is null
  ), false);
$$;

revoke execute on function public.is_activity_certificate_visible(uuid) from public;
grant execute on function public.is_activity_certificate_visible(uuid) to anon, authenticated, service_role;

create or replace function public.reject_archived_activity_operation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_activity_id uuid;
begin
  if tg_table_name = 'registrations' then
    v_activity_id := new.activity_id;
  elsif tg_table_name = 'attendance' then
    select registration.activity_id into v_activity_id
    from public.registrations registration
    where registration.id = new.registration_id;
  elsif tg_table_name = 'certificates' and new.certificate_type = 'activity' then
    select registration.activity_id into v_activity_id
    from public.registrations registration
    where registration.id = new.registration_id;
  end if;

  if exists (
    select 1
    from public.activities activity
    where activity.id = v_activity_id
      and activity.status = 'archived'
      and activity.deleted_at is null
  ) then
    raise exception 'ACTIVITY_ARCHIVED' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists reject_archived_registration_operation on public.registrations;
create trigger reject_archived_registration_operation
before insert or update on public.registrations
for each row execute function public.reject_archived_activity_operation();

drop trigger if exists reject_archived_attendance_operation on public.attendance;
create trigger reject_archived_attendance_operation
before insert or update on public.attendance
for each row execute function public.reject_archived_activity_operation();

drop trigger if exists reject_archived_certificate_operation on public.certificates;
create trigger reject_archived_certificate_operation
before insert or update on public.certificates
for each row execute function public.reject_archived_activity_operation();

create or replace view public.activity_participation_summary
with (security_invoker = true)
as
select
  activity.id as activity_id,
  activity.title,
  activity.slug,
  activity.type,
  activity.status,
  activity.capacity,
  activity.is_free,
  date_summary.next_date,
  date_summary.last_date,
  count(registration.id) filter (where registration.deleted_at is null)::integer as total_count,
  count(registration.id) filter (
    where registration.deleted_at is null and registration.status in ('pending', 'confirmed')
  )::integer as active_count,
  count(registration.id) filter (
    where registration.deleted_at is null and registration.status = 'pending'
  )::integer as pending_count,
  count(registration.id) filter (
    where registration.deleted_at is null and registration.status = 'confirmed'
  )::integer as confirmed_count,
  count(registration.id) filter (
    where registration.deleted_at is null and registration.status = 'cancelled'
  )::integer as cancelled_count,
  count(attendance.id) filter (
    where registration.deleted_at is null
      and registration.status = 'confirmed'
      and attendance.deleted_at is null
      and attendance.status = 'pending'
  )::integer as attendance_pending_count,
  count(attendance.id) filter (
    where registration.deleted_at is null
      and registration.status = 'confirmed'
      and attendance.deleted_at is null
      and attendance.status = 'attended'
  )::integer as attended_count,
  count(attendance.id) filter (
    where registration.deleted_at is null
      and registration.status = 'confirmed'
      and attendance.deleted_at is null
      and attendance.status = 'absent'
  )::integer as absent_count
from public.activities activity
left join lateral (
  select
    min(activity_date.starts_at) filter (where activity_date.starts_at >= now()) as next_date,
    max(activity_date.starts_at) as last_date
  from public.activity_dates activity_date
  where activity_date.activity_id = activity.id
    and activity_date.deleted_at is null
) date_summary on true
left join public.registrations registration on registration.activity_id = activity.id
left join public.attendance attendance
  on attendance.registration_id = registration.id and attendance.deleted_at is null
where activity.deleted_at is null
  and activity.status <> 'archived'
group by activity.id, activity.title, activity.slug, activity.type, activity.status,
  activity.capacity, activity.is_free, date_summary.next_date, date_summary.last_date;

revoke all on table public.activity_participation_summary from public, anon;
grant select on table public.activity_participation_summary to authenticated, service_role;

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

create or replace function public.get_activity_certificate_candidates(
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
  if not public.is_internal_user() then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  if p_activity_id is null or p_limit is null or p_limit < 1 or p_limit > 100
    or p_offset is null or p_offset < 0
  then raise exception 'VALIDATION_ERROR' using errcode = '22023'; end if;

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

create or replace function public.get_public_certificate(p_access_token text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'certificate_code', certificate.certificate_code,
    'certificate_type', certificate.certificate_type,
    'status', certificate.status,
    'participant_name', certificate.participant_name_snapshot,
    'title', certificate.title_snapshot,
    'condition', certificate.condition_snapshot,
    'date_text', certificate.date_text_snapshot,
    'academic_hours', certificate.academic_hours_snapshot,
    'issued_at', certificate.issued_at,
    'revoked_at', certificate.revoked_at,
    'revocation_reason', certificate.revocation_reason,
    'download_available', certificate.status = 'issued' and certificate.file_path is not null,
    'source_activity_id', activity.id,
    'source_activity_type', activity.type,
    'source_category_id', activity.category_id
  )
  from public.certificates certificate
  left join public.registrations registration on registration.id = certificate.registration_id
  left join public.activities activity on activity.id = registration.activity_id
  where certificate.access_token::text = lower(btrim(p_access_token))
    and certificate.deleted_at is null
    and public.is_activity_certificate_visible(certificate.id)
  limit 1;
$$;

create or replace function public.get_public_certificate_file(p_access_token text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select certificate.file_path
  from public.certificates certificate
  where certificate.access_token::text = lower(btrim(p_access_token))
    and certificate.status = 'issued'
    and certificate.file_path is not null
    and certificate.deleted_at is null
    and public.is_activity_certificate_visible(certificate.id)
  limit 1;
$$;

revoke execute on function public.get_public_certificate(text) from public;
grant execute on function public.get_public_certificate(text) to anon, authenticated, service_role;
revoke execute on function public.get_public_certificate_file(text) from public, anon, authenticated;
grant execute on function public.get_public_certificate_file(text) to service_role;

create or replace function public.get_my_certificates()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_person_id uuid := public.current_person_id();
  v_result jsonb;
begin
  if v_person_id is null then raise exception 'ACCOUNT_NOT_LINKED' using errcode = '42501'; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', certificate.id,
    'access_token', certificate.access_token,
    'certificate_code', certificate.certificate_code,
    'certificate_type', certificate.certificate_type,
    'status', certificate.status,
    'title', certificate.title_snapshot,
    'condition', certificate.condition_snapshot,
    'academic_hours', certificate.academic_hours_snapshot,
    'issued_at', certificate.issued_at,
    'file_ready', certificate.file_path is not null,
    'revocation_reason', certificate.revocation_reason,
    'course_id', enrollment.course_id
  ) order by certificate.issued_at desc), '[]'::jsonb) into v_result
  from public.certificates certificate
  left join public.course_enrollments enrollment on enrollment.id = certificate.course_enrollment_id
  where certificate.person_id = v_person_id
    and certificate.deleted_at is null
    and public.is_activity_certificate_visible(certificate.id);
  return v_result;
end;
$$;

revoke execute on function public.get_my_certificates() from public, anon;
grant execute on function public.get_my_certificates() to authenticated, service_role;

create or replace function public.search_public_certificates_by_dni(
  p_document_number text,
  p_ip_address inet default null,
  p_user_agent text default null,
  p_actor_user_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_document_number text := btrim(left(coalesce(p_document_number, ''), 20));
  v_person public.people%rowtype;
  v_certificates jsonb := '[]'::jsonb;
  v_recommendation_context jsonb;
  v_result_count integer := 0;
  v_outcome text;
begin
  if p_ip_address is not null then
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended('certificate-search:' || pg_catalog.host(p_ip_address), 0)
    );
  end if;

  if p_ip_address is not null and (
    select count(*) >= 60
    from (
      select 1 from public.audit_logs audit
      where audit.action = 'certificate.public_search'
        and audit.ip_address = p_ip_address
        and audit.created_at >= now() - interval '10 minutes'
      limit 60
    ) recent_searches
  ) then
    insert into public.audit_logs (actor_user_id, action, entity_type, new_data, ip_address, user_agent)
    values (
      p_actor_user_id, 'certificate.public_search.rate_limited', 'certificate_public_query',
      jsonb_build_object('document_number', v_document_number, 'outcome', 'rate_limited', 'result_count', 0),
      p_ip_address, left(p_user_agent, 500)
    );
    return jsonb_build_object('status', 'rate_limited', 'participant_name', null, 'certificates', '[]'::jsonb, 'recommendation_context', null);
  end if;

  if v_document_number !~ '^[0-9]{8}$' then
    insert into public.audit_logs (actor_user_id, action, entity_type, new_data, ip_address, user_agent)
    values (
      p_actor_user_id, 'certificate.public_search', 'certificate_public_query',
      jsonb_build_object('document_number', v_document_number, 'outcome', 'invalid', 'result_count', 0),
      p_ip_address, left(p_user_agent, 500)
    );
    return jsonb_build_object('status', 'invalid', 'participant_name', null, 'certificates', '[]'::jsonb, 'recommendation_context', null);
  end if;

  select * into v_person
  from public.people person
  where person.document_type = 'dni'
    and person.document_number = v_document_number
    and person.deleted_at is null
  limit 1;

  if found then
    select coalesce(jsonb_agg(jsonb_build_object(
      'access_token', certificate.access_token,
      'academic_hours', certificate.academic_hours_snapshot,
      'certificate_code', certificate.certificate_code,
      'certificate_type', certificate.certificate_type,
      'condition', certificate.condition_snapshot,
      'date_text', certificate.date_text_snapshot,
      'download_available', certificate.status = 'issued' and certificate.file_path is not null,
      'issued_at', certificate.issued_at,
      'participant_name', certificate.participant_name_snapshot,
      'revocation_reason', certificate.revocation_reason,
      'status', certificate.status,
      'title', certificate.title_snapshot
    ) order by certificate.issued_at desc), '[]'::jsonb), count(*)::integer
    into v_certificates, v_result_count
    from public.certificates certificate
    where certificate.person_id = v_person.id
      and certificate.deleted_at is null
      and public.is_activity_certificate_visible(certificate.id);

    select jsonb_build_object(
      'source_activity_id', activity.id,
      'source_activity_type', activity.type,
      'source_category_id', activity.category_id
    ) into v_recommendation_context
    from public.certificates certificate
    join public.registrations registration on registration.id = certificate.registration_id
    join public.activities activity on activity.id = registration.activity_id
    where certificate.person_id = v_person.id
      and certificate.certificate_type = 'activity'
      and certificate.deleted_at is null
      and activity.deleted_at is null
      and activity.status <> 'archived'
    order by certificate.issued_at desc
    limit 1;
  end if;

  v_outcome := case when v_result_count > 0 then 'found' else 'not_found' end;
  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, new_data, ip_address, user_agent)
  values (
    p_actor_user_id, 'certificate.public_search', 'certificate_public_query',
    case when v_result_count > 0 then v_person.id else null end,
    jsonb_build_object('document_number', v_document_number, 'outcome', v_outcome, 'result_count', v_result_count),
    p_ip_address, left(p_user_agent, 500)
  );

  return jsonb_build_object(
    'status', v_outcome,
    'participant_name', case when v_result_count > 0 then concat_ws(' ', v_person.first_names, v_person.last_names) else null end,
    'certificates', v_certificates,
    'recommendation_context', v_recommendation_context
  );
end;
$$;

revoke execute on function public.search_public_certificates_by_dni(text, inet, text, uuid) from public, anon, authenticated;
grant execute on function public.search_public_certificates_by_dni(text, inet, text, uuid) to service_role;

drop policy if exists certificates_storage_owner_read on storage.objects;
create policy certificates_storage_owner_read on storage.objects
for select to authenticated
using (
  bucket_id = 'certificates'
  and split_part(name, '/', 1) = 'issued'
  and split_part(name, '/', 2) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and exists (
    select 1
    from public.certificates certificate
    where certificate.id::text = split_part(storage.objects.name, '/', 2)
      and certificate.person_id = public.current_person_id()
      and certificate.status = 'issued'
      and certificate.file_path = storage.objects.name
      and certificate.deleted_at is null
      and public.is_activity_certificate_visible(certificate.id)
  )
);

