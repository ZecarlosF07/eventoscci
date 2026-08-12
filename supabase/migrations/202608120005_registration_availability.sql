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
      ) as registration_count
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
      and (capacity is null or registration_count < capacity),
    'reason', case
      when status = 'cancelled' then 'cancelled'
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

comment on function public.get_activity_registration_availability(uuid) is 'Expone disponibilidad pública sin revelar inscripciones ni datos personales.';
