create function public.reactivate_registration(p_registration_id uuid, p_reason text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_reference public.registrations%rowtype;
  v_old public.registrations%rowtype;
  v_new public.registrations%rowtype;
  v_activity public.activities%rowtype;
  v_status public.registration_status;
  v_reason text := nullif(btrim(p_reason), '');
begin
  if not public.is_internal_user() then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  if p_registration_id is null or length(coalesce(v_reason, '')) > 500
  then raise exception 'VALIDATION_ERROR' using errcode = '22023'; end if;

  select * into v_reference from public.registrations where id = p_registration_id and deleted_at is null;
  if not found then raise exception 'REGISTRATION_NOT_FOUND' using errcode = 'P0001'; end if;
  -- The activity lock serializes public registration, reactivation and pass transfers.
  select * into v_activity from public.activities where id = v_reference.activity_id for update;
  if not found or v_activity.deleted_at is not null or v_activity.status in ('archived', 'cancelled')
  then raise exception 'ACTIVITY_NOT_AVAILABLE' using errcode = 'P0001'; end if;
  if v_reference.member_group_request_id is not null then
    perform 1 from public.member_group_requests where id = v_reference.member_group_request_id for update;
  end if;
  select * into v_old from public.registrations where id = p_registration_id and deleted_at is null for update;
  if not found or v_old.activity_id <> v_activity.id
  then raise exception 'REGISTRATION_NOT_FOUND' using errcode = 'P0001'; end if;
  if v_old.status <> 'cancelled' then
    return jsonb_build_object('changed', false, 'registration_id', v_old.id,
      'activity_id', v_activity.id, 'status', v_old.status);
  end if;
  if not exists(select 1 from public.people where id = v_old.person_id and deleted_at is null)
  then raise exception 'PARTICIPANT_NOT_AVAILABLE' using errcode = 'P0001'; end if;
  if exists(select 1 from public.registrations where activity_id = v_activity.id and person_id = v_old.person_id
    and id <> v_old.id and status in ('pending', 'confirmed') and deleted_at is null)
  then raise exception 'DUPLICATE_REGISTRATION' using errcode = 'P0001'; end if;
  if v_activity.capacity is not null and (
    select count(*) from public.registrations where activity_id = v_activity.id
      and status in ('pending', 'confirmed') and deleted_at is null
  ) >= v_activity.capacity
  then raise exception 'NO_AVAILABLE_CAPACITY' using errcode = 'P0001'; end if;
  if v_old.is_complimentary and not exists (
    select 1 from public.member_complimentary_passes where registration_id = v_old.id
      and activity_id = v_activity.id and company_ruc = v_old.ruc_snapshot
  ) then raise exception 'COMPLIMENTARY_PASS_NOT_ASSIGNED' using errcode = 'P0001'; end if;

  v_status := case when v_old.price_snapshot = 0 or v_old.confirmed_at is not null
    or exists(select 1 from public.individual_registration_payments where registration_id = v_old.id)
    or exists(select 1 from public.member_group_payment_allocations where registration_id = v_old.id)
    then 'confirmed'::public.registration_status else 'pending'::public.registration_status end;
  update public.registrations set status = v_status,
    confirmed_at = case when v_status = 'confirmed' then coalesce(v_old.confirmed_at, now()) end,
    confirmed_by = case when v_status = 'confirmed' then coalesce(v_old.confirmed_by, auth.uid()) end,
    cancelled_at = null, cancelled_by = null, cancellation_reason = null
  where id = v_old.id returning * into v_new;

  update public.notification_outbox set deleted_at = now(), next_attempt_at = null
  where related_entity_type = 'registration' and related_entity_id = v_old.id
    and event_type = 'activity_registration_cancelled'
    and status in ('pending', 'failed', 'processing') and deleted_at is null;
  insert into public.audit_logs(actor_user_id, action, entity_type, entity_id, old_data, new_data, metadata)
  values(auth.uid(), 'registration.reactivated', 'registration', v_old.id, to_jsonb(v_old), to_jsonb(v_new),
    jsonb_build_object('reason', v_reason));
  return jsonb_build_object('changed', true, 'registration_id', v_new.id,
    'activity_id', v_activity.id, 'status', v_new.status);
end;
$$;

revoke all on function public.reactivate_registration(uuid, text) from public, anon;
grant execute on function public.reactivate_registration(uuid, text) to authenticated, service_role;
comment on function public.reactivate_registration(uuid, text) is
  'Audited administrative reactivation preserving registration identity and original pricing, checking capacity, duplicates and complimentary pass ownership.';
