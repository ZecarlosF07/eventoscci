create or replace function public.get_certificate_activity_summaries()
returns table (
  id uuid,
  title text,
  type public.activity_type,
  eligible_count bigint,
  issued_count bigint
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

  return query
  select
    activity.id,
    activity.title,
    activity.type,
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
  group by activity.id, activity.title, activity.type, activity.updated_at
  order by activity.updated_at desc;
end;
$$;

revoke all on function public.get_certificate_activity_summaries() from public, anon;
grant execute on function public.get_certificate_activity_summaries() to authenticated;

create index if not exists idx_certificates_registration_status_active
  on public.certificates(registration_id, status)
  where deleted_at is null and certificate_type = 'activity';

create index if not exists idx_course_enrollments_course_status_active
  on public.course_enrollments(course_id, status)
  where deleted_at is null;

create index if not exists idx_lessons_module_published_active
  on public.lessons(module_id, is_published, sort_order)
  where deleted_at is null;
