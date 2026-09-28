-- Existing individual history remains operable after an event becomes exclusive.
-- New individual seats still cannot bypass the group flow or the active roster.
create or replace function public.protect_member_group_registration()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_activity public.activities%rowtype;
  v_group public.member_group_requests%rowtype;
begin
  select * into v_activity from public.activities where id = new.activity_id;
  if tg_op = 'INSERT' and new.is_complimentary then
    raise exception 'COMPLIMENTARY_PASS_REQUIRED' using errcode = 'P0001';
  end if;
  if v_activity.type = 'event' and v_activity.members_only
    and new.member_group_request_id is null
    and (tg_op = 'INSERT' or new.activity_id is distinct from old.activity_id) then
    raise exception 'EXCLUSIVE_EVENT_REQUIRES_GROUP' using errcode = 'P0001';
  end if;
  if tg_op = 'UPDATE' then
    if new.member_group_request_id is distinct from old.member_group_request_id then
      raise exception 'GROUP_MEMBERSHIP_IMMUTABLE' using errcode = 'P0001';
    end if;
    if old.member_group_request_id is not null
      and new.is_complimentary is distinct from old.is_complimentary
      and not (not old.is_complimentary and new.is_complimentary
        and old.status = 'pending' and new.status = 'confirmed'
        and new.price_snapshot = 0
        and exists (select 1 from public.member_complimentary_passes pass
          where pass.registration_id = new.id)) then
      raise exception 'COMPLIMENTARY_STATUS_IMMUTABLE' using errcode = 'P0001';
    end if;
    if old.member_group_request_id is not null
      and new.price_snapshot is distinct from old.price_snapshot
      and not (old.status = 'pending' and new.status = 'confirmed'
        and old.price_snapshot > 0 and new.price_snapshot = 0
        and new.is_complimentary
        and exists (select 1 from public.member_complimentary_passes pass
          where pass.registration_id = new.id)) then
      raise exception 'GROUP_PRICE_IMMUTABLE' using errcode = 'P0001';
    end if;
  end if;
  if new.member_group_request_id is null then return new; end if;
  select * into v_group from public.member_group_requests where id = new.member_group_request_id;
  if not found or v_group.activity_id <> new.activity_id
    or new.registration_type <> 'member' or new.ruc_snapshot <> v_group.company_ruc then
    raise exception 'INVALID_GROUP_REGISTRATION' using errcode = 'P0001';
  end if;
  if tg_op = 'UPDATE' then
    if old.status = 'pending' and new.status = 'confirmed' and new.price_snapshot > 0
      and not exists (select 1 from public.member_group_payment_allocations allocation
        where allocation.registration_id = new.id) then
      raise exception 'GROUP_PAYMENT_REQUIRED' using errcode = 'P0001';
    end if;
    if old.status = 'confirmed' and new.status = 'cancelled'
      and exists (select 1 from public.member_group_payment_allocations allocation
        where allocation.registration_id = new.id) then
      raise exception 'PAID_GROUP_SEAT_CANNOT_CANCEL' using errcode = 'P0001';
    end if;
    if old.status = 'confirmed' and new.status = 'cancelled'
      and old.is_complimentary and (
        exists (select 1 from public.attendance attendance
          where attendance.registration_id = old.id and attendance.status <> 'pending')
        or exists (select 1 from public.certificates certificate
          where certificate.registration_id = old.id and certificate.status = 'issued')
      ) then
      raise exception 'COMPLIMENTARY_SEAT_ALREADY_USED' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;
