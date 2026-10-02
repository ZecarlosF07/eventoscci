-- Optional event presale; existing regular prices and registration snapshots remain intact.
alter table public.activities
  add column presale_general_price numeric,
  add column presale_member_price numeric,
  add column presale_ends_at timestamptz,
  add constraint activities_presale_amounts_valid check (
    (presale_general_price is null or (presale_general_price > 0 and presale_general_price < 100000000 and presale_general_price = trunc(presale_general_price, 2)))
    and (presale_member_price is null or (presale_member_price > 0 and presale_member_price < 100000000 and presale_member_price = trunc(presale_member_price, 2)))
  );
comment on column public.activities.presale_ends_at is
  'Exclusive boundary: midnight after the final presale day in America/Lima.';

create function public.validate_activity_presale()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_activity public.activities%rowtype;
begin
  -- Save wrappers write commercial fields in multiple steps; validate their final row.
  select * into v_activity from public.activities where id = new.id;
  if not found then return null; end if;
  if (v_activity.presale_general_price is not null or v_activity.presale_member_price is not null) then
    if v_activity.type <> 'event' or v_activity.is_free
      or (v_activity.members_only and v_activity.presale_general_price is not null)
      or ((v_activity.status = 'published' or v_activity.general_price > 0)
        and v_activity.presale_general_price >= v_activity.general_price)
      or ((v_activity.status = 'published' or v_activity.member_price > 0)
        and v_activity.presale_member_price >= v_activity.member_price)
      or (v_activity.status = 'published' and v_activity.presale_ends_at is null) then
      raise exception 'INVALID_ACTIVITY_PRESALE' using errcode = '23514';
    end if;
  elsif v_activity.presale_ends_at is not null then
    raise exception 'INVALID_ACTIVITY_PRESALE' using errcode = '23514';
  end if;
  return null;
end $$;
revoke all on function public.validate_activity_presale() from public, anon, authenticated, service_role;
create constraint trigger validate_activity_presale after insert or update on public.activities
  deferrable initially deferred for each row execute function public.validate_activity_presale();

alter function public.save_activity(jsonb,jsonb,jsonb) rename to save_activity_without_presale;
revoke all on function public.save_activity_without_presale(jsonb,jsonb,jsonb) from public,anon,authenticated,service_role;
create function public.save_activity(p_activity jsonb,p_dates jsonb,p_speakers jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
  v_before jsonb;
  v_after jsonb;
  v_previous public.activities%rowtype;
  v_general numeric;
  v_member numeric;
  v_end timestamptz;
begin
  if not public.is_internal_user() then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  if nullif(p_activity->>'id','') is not null then
    select * into v_previous from public.activities where id = (p_activity->>'id')::uuid for update;
  end if;
  v_before := jsonb_build_object('presale_general_price',v_previous.presale_general_price,
    'presale_member_price',v_previous.presale_member_price,'presale_ends_at',v_previous.presale_ends_at);
  v_general := case when p_activity ? 'presale_general_price' then nullif(p_activity->>'presale_general_price','')::numeric else v_previous.presale_general_price end;
  v_member := case when p_activity ? 'presale_member_price' then nullif(p_activity->>'presale_member_price','')::numeric else v_previous.presale_member_price end;
  v_end := case when p_activity ? 'presale_ends_at' then nullif(p_activity->>'presale_ends_at','')::timestamptz else v_previous.presale_ends_at end;
  v_id := public.save_activity_without_presale(p_activity,p_dates,p_speakers);
  update public.activities set
    presale_general_price = case when type = 'event' and not is_free and not members_only then v_general else null end,
    presale_member_price = case when type = 'event' and not is_free then v_member else null end,
    presale_ends_at = case when type = 'event' and not is_free and (v_member is not null or (not members_only and v_general is not null)) then v_end else null end
  where id = v_id
  returning jsonb_build_object('presale_general_price',presale_general_price,
    'presale_member_price',presale_member_price,'presale_ends_at',presale_ends_at) into v_after;
  if v_before is distinct from v_after then
    insert into public.audit_logs(actor_user_id,action,entity_type,entity_id,old_data,new_data)
    values (auth.uid(),'activity.presale_changed','activity',v_id,v_before,v_after);
  end if;
  return v_id;
end $$;
revoke all on function public.save_activity(jsonb,jsonb,jsonb) from public,anon;
grant execute on function public.save_activity(jsonb,jsonb,jsonb) to authenticated,service_role;

create function public.activity_participation_price(p_activity public.activities,p_audience text,p_at timestamptz)
returns numeric language sql immutable set search_path = '' as $$
  select case when p_activity.is_free then 0
    when p_activity.type = 'event' and p_activity.presale_ends_at > p_at then
      case when p_audience = 'member' then coalesce(p_activity.presale_member_price,p_activity.member_price)
        else coalesce(p_activity.presale_general_price,p_activity.general_price) end
    when p_audience = 'member' then p_activity.member_price else p_activity.general_price end;
$$;
revoke all on function public.activity_participation_price(public.activities,text,timestamptz) from public,anon,authenticated,service_role;

create function public.assert_activity_expected_price(p_input jsonb,p_price numeric,p_has_presale boolean)
returns void language plpgsql immutable set search_path = '' as $$
begin
  if not (p_input ? 'expected_unit_price') then
    if p_has_presale then raise exception 'PRICE_CHANGED' using errcode = 'P0001'; end if;
  elsif coalesce(p_input->>'expected_unit_price','') !~ '^[0-9]+(\.[0-9]{1,2})?$' then
    raise exception 'PRICE_CHANGED' using errcode = 'P0001';
  elsif (p_input->>'expected_unit_price')::numeric <> p_price then
    raise exception 'PRICE_CHANGED' using errcode = 'P0001';
  end if;
end $$;
revoke all on function public.assert_activity_expected_price(jsonb,numeric,boolean) from public,anon,authenticated,service_role;

-- Reuse the current personal-data core, including student/RUC/province guards.
-- Its private priced variant accepts only the amount computed by the locked wrapper.
do $$
declare
  v_definition text;
  v_signature text := 'public.register_activity_internal_before_billing(p_activity_id uuid, p_registration jsonb)';
  v_price text := 'v_price := case
    when v_activity.is_free then 0
    when v_registration_type = ''member'' then v_activity.member_price
    else v_activity.general_price
  end;';
begin
  select pg_get_functiondef('public.register_activity_internal_before_billing(uuid,jsonb)'::regprocedure) into v_definition;
  if strpos(v_definition,v_signature) = 0 or strpos(v_definition,v_price) = 0 then raise exception 'PRESALE_INDIVIDUAL_PATCH_NOT_FOUND'; end if;
  v_definition := replace(v_definition,v_signature,'public.register_activity_priced(p_activity_id uuid, p_registration jsonb, p_unit_price numeric)');
  execute replace(v_definition,v_price,'v_price := p_unit_price;');
end $$;
revoke all on function public.register_activity_priced(uuid,jsonb,numeric) from public,anon,authenticated,service_role;

create or replace function public.register_activity_internal(p_activity_id uuid,p_registration jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_activity public.activities%rowtype;
  v_price numeric;
  v_at timestamptz;
  v_billing jsonb;
  v_result jsonb;
begin
  select * into v_activity from public.activities where id = p_activity_id for update;
  if not found then raise exception 'ACTIVITY_NOT_FOUND' using errcode = 'P0001'; end if;
  v_at := clock_timestamp();
  v_price := public.activity_participation_price(v_activity,lower(btrim(p_registration->>'registration_type')),v_at);
  perform public.assert_activity_expected_price(p_registration,v_price,
    v_activity.presale_general_price is not null or v_activity.presale_member_price is not null);
  if v_price > 0 then
    if p_registration->'billing' is not null and p_registration->'billing' <> 'null'::jsonb then
      v_billing := public.normalize_participation_billing(p_registration->'billing');
    elsif p_registration ? 'billing' or public.registration_billing_enforced() then
      raise exception 'BILLING_REQUIRED' using errcode = '22023';
    end if;
  end if;
  v_result := public.register_activity_priced(p_activity_id,p_registration,v_price);
  if (v_result->>'price_snapshot')::numeric > 0 and v_billing is not null then
    insert into public.registration_billing_details(registration_id,billing_type,billing_document,billing_name,billing_address)
    values ((v_result->>'registration_id')::uuid,v_billing->>'type',v_billing->>'document',v_billing->>'name',v_billing->>'address');
  end if;
  return v_result;
end $$;
revoke all on function public.register_activity_internal(uuid,jsonb) from public,anon,authenticated,service_role;

-- Keep the old private group core for historical idempotent replays; new requests
-- receive the captured price. Preserve the public complimentary-pass wrapper.
do $$
declare
  v_definition text;
  v_signature text := 'public.register_member_group_without_passes(p_activity_id uuid, p_request jsonb, p_idempotency_key uuid)';
  v_price text := 'v_price := case when v_activity.is_free then 0 else v_activity.member_price end;';
  v_call text := 'v_result := public.register_member_group_without_passes(
    p_activity_id, v_request, p_idempotency_key);';
  v_guard text := 'if v_free_count = v_attendee_count and not v_activity.is_free then';
begin
  select pg_get_functiondef('public.register_member_group_without_passes(uuid,jsonb,uuid)'::regprocedure) into v_definition;
  if strpos(v_definition,v_signature) = 0 or strpos(v_definition,v_price) = 0 then raise exception 'PRESALE_GROUP_CORE_PATCH_NOT_FOUND'; end if;
  v_definition := replace(v_definition,v_signature,'public.register_member_group_priced(p_activity_id uuid, p_request jsonb, p_idempotency_key uuid, p_unit_price numeric)');
  execute replace(v_definition,v_price,'v_price := p_unit_price;');
  select pg_get_functiondef('public.register_member_group(uuid,jsonb,uuid)'::regprocedure) into v_definition;
  if strpos(v_definition,v_call) = 0 or strpos(v_definition,v_guard) = 0 then raise exception 'PRESALE_GROUP_WRAPPER_PATCH_NOT_FOUND'; end if;
  v_definition := replace(v_definition,'v_used integer;','v_used integer;
  v_unit_price numeric;');
  v_definition := replace(v_definition,v_guard,'v_unit_price := public.activity_participation_price(v_activity,''member'',clock_timestamp());
  if not v_activity.is_free then
    perform public.assert_activity_expected_price(p_request,v_unit_price,
      v_activity.presale_general_price is not null or v_activity.presale_member_price is not null);
  end if;
  ' || v_guard);
  v_definition := replace(v_definition,v_call,'v_result := public.register_member_group_priced(
    p_activity_id, v_request, p_idempotency_key, v_unit_price);');
  v_definition := replace(v_definition,'v_activity.member_price *
        (v_attendee_count - v_free_count)','(select coalesce(sum(price_snapshot),0) from public.registrations where member_group_request_id = v_group_id)');
  execute v_definition;
end $$;
revoke all on function public.register_member_group_priced(uuid,jsonb,uuid,numeric) from public,anon,authenticated,service_role;
