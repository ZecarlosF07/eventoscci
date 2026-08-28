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
    activity.title::text,
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
