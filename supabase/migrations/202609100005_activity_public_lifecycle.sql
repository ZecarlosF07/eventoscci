-- Close registrations when the final activity session ends.

create or replace function public.get_activity_registration_availability(
  p_activity_id uuid
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with activity_registration_counts as (
    select
      activities.*,
      count(registrations.id) filter (
        where registrations.status in ('pending', 'confirmed')
          and registrations.deleted_at is null
      ) as registration_count,
      (
        select max(coalesce(activity_dates.ends_at, activity_dates.starts_at))
        from public.activity_dates
        where activity_dates.activity_id = activities.id
          and activity_dates.deleted_at is null
      ) as activity_ends_at
    from public.activities
    left join public.registrations on registrations.activity_id = activities.id
    where activities.id = p_activity_id
      and activities.deleted_at is null
      and activities.published_at is not null
    group by activities.id
  )
  select jsonb_build_object(
    'is_open',
      status = 'published'
      and not registrations_closed_manually
      and (registration_open_at is null or now() >= registration_open_at)
      and (registration_close_at is null or now() <= registration_close_at)
      and (activity_ends_at is null or now() < activity_ends_at)
      and (capacity is null or registration_count < capacity),
    'reason', case
      when status = 'cancelled' then 'cancelled'
      when status = 'finished' then 'finished'
      when activity_ends_at is not null and now() >= activity_ends_at then 'finished'
      when status <> 'published' then 'closed'
      when registrations_closed_manually then 'closed'
      when registration_open_at is not null and now() < registration_open_at then 'not_open'
      when registration_close_at is not null and now() > registration_close_at then 'closed'
      when capacity is not null and registration_count >= capacity then 'full'
      else 'available'
    end,
    'remaining_capacity', case
      when capacity is null then null
      else greatest(capacity - registration_count, 0)
    end
  )
  from activity_registration_counts;
$$;

revoke execute on function public.get_activity_registration_availability(uuid) from public;
grant execute on function public.get_activity_registration_availability(uuid) to anon, authenticated, service_role;

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
begin
  select max(coalesce(activity_dates.ends_at, activity_dates.starts_at))
  into v_activity_ends_at
  from public.activity_dates
  where activity_dates.activity_id = p_activity_id
    and activity_dates.deleted_at is null;

  if v_activity_ends_at is not null and now() >= v_activity_ends_at then
    raise exception 'REGISTRATION_CLOSED' using errcode = 'P0001';
  end if;

  select id
  into v_person_id
  from public.people
  where document_type::text = lower(btrim(p_registration->>'document_type'))
    and document_number = upper(btrim(p_registration->>'document_number'));

  if v_person_id is not null and exists (
    select 1
    from public.registrations
    where activity_id = p_activity_id
      and person_id = v_person_id
      and deleted_at is null
  ) then
    raise exception 'DUPLICATE_REGISTRATION' using errcode = '23505';
  end if;

  return public.register_activity_internal(p_activity_id, p_registration);
end;
$$;

revoke execute on function public.register_activity(uuid, jsonb) from public;
grant execute on function public.register_activity(uuid, jsonb) to anon, authenticated, service_role;

comment on function public.get_activity_registration_availability(uuid)
  is 'Expone disponibilidad pública y cierra la inscripción al terminar la última sesión.';
comment on function public.register_activity(uuid, jsonb)
  is 'Punto público idempotente que impide nuevas inscripciones después de finalizar la actividad.';
