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
    where registration.deleted_at is null
      and registration.status in ('pending', 'confirmed')
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
left join public.registrations registration
  on registration.activity_id = activity.id
left join public.attendance attendance
  on attendance.registration_id = registration.id
  and attendance.deleted_at is null
where activity.deleted_at is null
group by
  activity.id,
  activity.title,
  activity.slug,
  activity.type,
  activity.status,
  activity.capacity,
  activity.is_free,
  date_summary.next_date,
  date_summary.last_date;

revoke all on table public.activity_participation_summary from public, anon;
grant select on table public.activity_participation_summary to authenticated, service_role;

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
  v_notes text := nullif(btrim(p_notes), '');
  v_old public.attendance%rowtype;
  v_processed integer := 0;
begin
  if not public.is_active_admin() then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;

  v_expected := cardinality(p_attendance_ids);
  if v_expected is null or v_expected = 0 or v_expected > 500 or p_status is null then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  if p_notes is not null and length(btrim(p_notes)) > 500 then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  perform 1
  from public.attendance attendance_row
  join public.registrations registration
    on registration.id = attendance_row.registration_id
  where attendance_row.id = any(p_attendance_ids)
    and attendance_row.deleted_at is null
    and registration.deleted_at is null
  order by attendance_row.id
  for update of attendance_row, registration;

  if p_status <> 'pending' and exists (
    select 1
    from public.attendance attendance_row
    join public.registrations registration
      on registration.id = attendance_row.registration_id
    where attendance_row.id = any(p_attendance_ids)
      and attendance_row.deleted_at is null
      and registration.deleted_at is null
      and registration.status <> 'confirmed'
  ) then
    raise exception 'REGISTRATION_NOT_CONFIRMED' using errcode = 'P0001';
  end if;

  for v_old in
    select attendance_row.*
    from public.attendance attendance_row
    join public.registrations registration
      on registration.id = attendance_row.registration_id
    where attendance_row.id = any(p_attendance_ids)
      and attendance_row.deleted_at is null
      and registration.deleted_at is null
    order by attendance_row.id
    for update of attendance_row
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
      actor_user_id, action, entity_type, entity_id, old_data, new_data, metadata
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

revoke execute on function public.set_attendance_status(uuid[], public.attendance_status, text) from public, anon;
grant execute on function public.set_attendance_status(uuid[], public.attendance_status, text) to authenticated, service_role;

comment on view public.activity_participation_summary is
  'Resumen operativo de inscripciones y asistencia por actividad para cuentas internas.';
comment on function public.set_attendance_status(uuid[], public.attendance_status, text) is
  'Actualiza asistencia de forma atómica; solo inscripciones confirmadas pueden marcarse como asistieron o ausentes.';
