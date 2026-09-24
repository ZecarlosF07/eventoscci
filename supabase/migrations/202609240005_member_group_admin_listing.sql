-- One operational row per group, with derived amounts and no duplicated revenue.
create or replace function public.list_member_group_requests(
  p_query text default null,
  p_activity_id uuid default null,
  p_status text default null,
  p_page integer default 1,
  p_page_size integer default 20
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if not public.is_internal_user() then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;
  if p_page not between 1 and 100000 or p_page_size not between 1 and 100
    or p_status is not null and p_status not in ('pending', 'partial', 'complete')
    or length(coalesce(p_query, '')) > 100
  then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  with group_amounts as (
    select request.id, request.activity_id, request.request_code,
      request.company_ruc, request.company_name_snapshot,
      request.billing_type, request.billing_document, request.coordinator_email,
      concat_ws(' ', coordinator.first_names, coordinator.last_names) as coordinator_name,
      request.created_at, activity.title as activity_title,
      floor(extract(epoch from (now() - request.created_at)) / 86400)::integer as age_days,
      count(registration.id) filter (where registration.deleted_at is null and registration.status <> 'cancelled') as seat_count,
      count(registration.id) filter (where registration.deleted_at is null and registration.status = 'confirmed') as confirmed_count,
      count(registration.id) filter (where registration.deleted_at is null and registration.status = 'pending') as pending_count,
      coalesce(sum(registration.price_snapshot) filter (where registration.deleted_at is null and registration.status <> 'cancelled'), 0) as total,
      coalesce(sum(registration.price_snapshot) filter (where registration.deleted_at is null and registration.status = 'confirmed'), 0) as confirmed_amount,
      coalesce(sum(registration.price_snapshot) filter (where registration.deleted_at is null and registration.status = 'pending'), 0) as pending_amount
    from public.member_group_requests request
    join public.activities activity on activity.id = request.activity_id
      and activity.deleted_at is null and activity.status <> 'archived'
    left join public.people coordinator on coordinator.id = request.coordinator_person_id
    left join public.registrations registration on registration.member_group_request_id = request.id
    where (p_activity_id is null or request.activity_id = p_activity_id)
      and (nullif(btrim(p_query), '') is null
        or request.company_ruc ilike '%' || btrim(p_query) || '%'
        or request.billing_document ilike '%' || btrim(p_query) || '%'
        or request.request_code ilike '%' || btrim(p_query) || '%'
        or request.company_name_snapshot ilike '%' || btrim(p_query) || '%'
        or exists (select 1 from public.registrations seat
          join public.people person on person.id = seat.person_id
          where seat.member_group_request_id = request.id
            and (person.first_names ilike '%' || btrim(p_query) || '%'
              or person.last_names ilike '%' || btrim(p_query) || '%'))
        or exists (select 1 from public.member_group_payments payment
          where payment.request_id = request.id
            and payment.payment_reference ilike '%' || btrim(p_query) || '%'))
    group by request.id, activity.id, coordinator.id
  ), filtered as (
    select *, case
      when pending_count = 0 then 'complete'
      when confirmed_count > 0 then 'partial'
      else 'pending' end as group_status
    from group_amounts
  ), selected as (
    select * from filtered
    where p_status is null or group_status = p_status
  ), page as (
    select * from selected
    order by case when pending_count > 0 then 0 else 1 end,
      created_at asc, id
    limit p_page_size offset (p_page - 1) * p_page_size
  )
  select jsonb_build_object(
    'total', (select count(*) from selected),
    'items', coalesce((select jsonb_agg(to_jsonb(page) order by
      case when page.pending_count > 0 then 0 else 1 end, page.created_at asc, page.id)
      from page), '[]'::jsonb),
    'ruc_summary', case when btrim(coalesce(p_query, '')) ~ '^[0-9]{11}$' then
      (select jsonb_build_object('requests', count(*), 'seats', coalesce(sum(seat_count), 0),
        'total', coalesce(sum(total), 0), 'pending', coalesce(sum(pending_amount), 0))
      from selected where company_ruc = btrim(p_query))
      else null end
  ) into v_result;
  return v_result;
end;
$$;

revoke execute on function public.list_member_group_requests(text, uuid, text, integer, integer)
  from public, anon;
grant execute on function public.list_member_group_requests(text, uuid, text, integer, integer)
  to authenticated, service_role;
