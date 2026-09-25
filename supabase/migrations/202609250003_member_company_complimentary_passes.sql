-- Hito 16: one auditable quota per company and exclusive paid event.
alter table public.activities
  add column member_free_passes_per_company integer not null default 0,
  add constraint activities_member_free_passes_valid check (
    member_free_passes_per_company >= 0
    and (member_free_passes_per_company = 0 or (type = 'event' and members_only and not is_free))
  );

alter table public.registrations
  add column is_complimentary boolean not null default false,
  add constraint registrations_complimentary_price_valid check (
    not is_complimentary or (price_snapshot = 0 and member_group_request_id is not null)
  );

create table public.member_complimentary_passes (
  id uuid primary key default extensions.gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete restrict,
  company_ruc text not null references public.member_companies(ruc) on delete restrict,
  slot_number integer not null check (slot_number > 0),
  registration_id uuid not null unique references public.registrations(id) on delete restrict,
  created_at timestamptz not null default now(),
  transferred_at timestamptz,
  unique (activity_id, company_ruc, slot_number)
);
create index idx_member_complimentary_passes_company
  on public.member_complimentary_passes(activity_id, company_ruc);
alter table public.member_complimentary_passes enable row level security;
revoke all on public.member_complimentary_passes from public, anon, authenticated;
grant select on public.member_complimentary_passes to authenticated;
grant all on public.member_complimentary_passes to service_role;
create policy member_complimentary_passes_internal_select
  on public.member_complimentary_passes for select to authenticated
  using (public.is_internal_user());
create policy audit_logs_member_pass_internal_read
  on public.audit_logs for select to authenticated
  using (public.is_internal_user() and action in (
    'member_group.complimentary_pass_assigned',
    'member_group.complimentary_pass_transferred'
  ));

create or replace function public.protect_member_free_pass_configuration()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if exists (select 1 from public.registrations registration
    where registration.activity_id = old.id and registration.member_group_request_id is not null)
    and (new.member_free_passes_per_company < old.member_free_passes_per_company
      or (old.member_free_passes_per_company > 0
        and (new.is_free or not new.members_only or new.type <> 'event')))
  then
    raise exception 'MEMBER_FREE_PASSES_LOCKED' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
create trigger protect_member_free_pass_configuration_before_update
  before update of member_free_passes_per_company, is_free, members_only, type
  on public.activities for each row execute function public.protect_member_free_pass_configuration();

alter function public.save_activity(jsonb, jsonb, jsonb)
  rename to save_activity_without_passes;
revoke execute on function public.save_activity_without_passes(jsonb, jsonb, jsonb)
  from public, anon, authenticated, service_role;

create or replace function public.save_activity(
  p_activity jsonb, p_dates jsonb, p_speakers jsonb
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
  v_requested integer;
  v_existing public.activities%rowtype;
begin
  if not public.is_internal_user() then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;
  if coalesce(p_activity->>'member_free_passes_per_company', '0') !~ '^[0-9]{1,9}$' then
    raise exception 'INVALID_MEMBER_FREE_PASSES' using errcode = '22023';
  end if;
  v_requested := coalesce((p_activity->>'member_free_passes_per_company')::integer, 0);
  if v_requested > 0 and (p_activity->>'type' <> 'event'
    or coalesce((p_activity->>'is_free')::boolean, false)
    or not coalesce((p_activity->>'members_only')::boolean, false)) then
    raise exception 'INVALID_MEMBER_FREE_PASSES' using errcode = '22023';
  end if;
  if nullif(p_activity->>'id', '') is not null then
    select * into v_existing from public.activities
      where id = (p_activity->>'id')::uuid for update;
    if found and v_existing.member_free_passes_per_company > 0
      and v_requested = 0 and not exists (
        select 1 from public.registrations registration
        where registration.activity_id = v_existing.id
          and registration.member_group_request_id is not null)
    then
      update public.activities set member_free_passes_per_company = 0
      where id = v_existing.id;
    end if;
  end if;
  v_id := public.save_activity_without_passes(p_activity, p_dates, p_speakers);
  update public.activities set member_free_passes_per_company = v_requested where id = v_id;
  if coalesce(v_existing.member_free_passes_per_company, 0) <> v_requested then
    insert into public.audit_logs(
      actor_user_id, action, entity_type, entity_id, old_data, new_data)
    values (auth.uid(), 'activity.member_free_passes_changed', 'activity', v_id,
      jsonb_build_object('member_free_passes_per_company',
        coalesce(v_existing.member_free_passes_per_company, 0)),
      jsonb_build_object('member_free_passes_per_company', v_requested));
  end if;
  return v_id;
end;
$$;
revoke execute on function public.save_activity(jsonb, jsonb, jsonb) from public, anon;
grant execute on function public.save_activity(jsonb, jsonb, jsonb) to authenticated, service_role;

create or replace function public.get_member_pass_availability(
  p_activity_id uuid, p_ruc text
)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  v_quota integer;
  v_used integer;
begin
  if auth.role() <> 'service_role' or p_ruc !~ '^[0-9]{11}$' then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;
  select activity.member_free_passes_per_company into v_quota
  from public.activities activity
  join public.member_companies company on company.ruc = p_ruc and company.is_active
  where activity.id = p_activity_id and activity.type = 'event'
    and activity.members_only and activity.status = 'published'
    and activity.deleted_at is null;
  if not found then raise exception 'MEMBER_RUC_INACTIVE' using errcode = 'P0001'; end if;
  select count(*) into v_used from public.member_complimentary_passes pass
  where pass.activity_id = p_activity_id and pass.company_ruc = p_ruc;
  return jsonb_build_object('quota', v_quota, 'used', v_used,
    'remaining', greatest(v_quota - v_used, 0));
end;
$$;
revoke execute on function public.get_member_pass_availability(uuid, text)
  from public, anon, authenticated;
grant execute on function public.get_member_pass_availability(uuid, text) to service_role;

-- A transferred unpaid seat may change price only after receiving the same audited pass.
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
    and new.member_group_request_id is null then
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

-- Keep the previous operation for zero-quota events and reuse its validation/atomic group creation.
alter function public.register_member_group(uuid, jsonb, uuid)
  rename to register_member_group_without_passes;
revoke execute on function public.register_member_group_without_passes(uuid, jsonb, uuid)
  from public, anon, authenticated, service_role;

create or replace function public.register_member_group(
  p_activity_id uuid, p_request jsonb, p_idempotency_key uuid
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_activity public.activities%rowtype;
  v_attendee_count integer;
  v_expected integer;
  v_free_count integer;
  v_group_id uuid;
  v_index integer := 0;
  v_pass_number integer;
  v_previous public.member_group_requests%rowtype;
  v_registration public.registrations%rowtype;
  v_request jsonb := p_request;
  v_result jsonb;
  v_ruc text := btrim(p_request->>'ruc');
  v_used integer;
begin
  if p_request is null or p_idempotency_key is null
    or jsonb_typeof(p_request->'attendees') <> 'array'
    or coalesce(p_request->>'expected_free_count', '0') !~ '^[0-9]{1,3}$' then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;
  v_attendee_count := jsonb_array_length(p_request->'attendees');
  v_expected := coalesce((p_request->>'expected_free_count')::integer, 0);
  if v_expected > v_attendee_count then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;
  perform pg_advisory_xact_lock(hashtext(p_idempotency_key::text));
  select * into v_previous from public.member_group_requests
    where idempotency_key = p_idempotency_key;
  if found then
    return public.register_member_group_without_passes(
      p_activity_id,
      case when v_previous.billing_type is null and not v_previous.is_free_snapshot
        then p_request || jsonb_build_object('billing', jsonb_build_object(
          'type', 'boleta', 'document', '00000000', 'name', 'Sin comprobante'))
        else p_request end,
      p_idempotency_key);
  end if;
  select * into v_activity from public.activities where id = p_activity_id for update;
  if not found then raise exception 'ACTIVITY_NOT_FOUND' using errcode = 'P0001'; end if;
  select count(*) into v_used from public.member_complimentary_passes pass
  where pass.activity_id = p_activity_id and pass.company_ruc = v_ruc;
  v_free_count := case when v_activity.is_free then 0
    else least(v_attendee_count,
      greatest(v_activity.member_free_passes_per_company - v_used, 0)) end;
  if v_free_count <> v_expected then
    raise exception 'BENEFIT_AVAILABILITY_CHANGED' using errcode = 'P0001';
  end if;
  if v_free_count = v_attendee_count and not v_activity.is_free then
    if p_request->'billing' <> 'null'::jsonb then
      raise exception 'INVALID_BILLING' using errcode = '22023';
    end if;
    v_request := p_request || jsonb_build_object('billing', jsonb_build_object(
      'type', 'boleta', 'document', '00000000', 'name', 'Sin comprobante'));
  elsif v_free_count < v_attendee_count and not v_activity.is_free
    and (p_request->'billing' is null or p_request->'billing' = 'null'::jsonb) then
    raise exception 'INVALID_BILLING' using errcode = '22023';
  end if;
  v_result := public.register_member_group_without_passes(
    p_activity_id, v_request, p_idempotency_key);
  if v_activity.is_free or v_free_count = 0 then return v_result; end if;
  v_group_id := (v_result->>'request_id')::uuid;
  for v_registration in select * from public.registrations registration
    where registration.member_group_request_id = v_group_id
    order by registration.registration_code
  loop
    v_index := v_index + 1;
    if v_index <= v_free_count then
      v_pass_number := v_used + v_index;
      insert into public.member_complimentary_passes(
        activity_id, company_ruc, slot_number, registration_id)
      values (p_activity_id, v_ruc, v_pass_number, v_registration.id);
      insert into public.audit_logs(
        actor_user_id, action, entity_type, entity_id, old_data, new_data, metadata)
      values (
        null, 'member_group.complimentary_pass_assigned', 'registration',
        v_registration.id,
        jsonb_build_object('price', v_registration.price_snapshot,
          'status', v_registration.status),
        jsonb_build_object('price', 0, 'status', 'confirmed'),
        jsonb_build_object('activity_id', p_activity_id, 'company_ruc', v_ruc,
          'slot_number', v_pass_number, 'request_id', v_group_id));
      update public.registrations set price_snapshot = 0,
        is_complimentary = true, status = 'confirmed', confirmed_at = now()
      where id = v_registration.id;
      if v_index > 1 or v_free_count < v_attendee_count then
        insert into public.notification_outbox(
          person_id, event_type, recipient_email, related_entity_type,
          related_entity_id, payload)
        select v_registration.person_id, 'activity_free_registration_confirmed',
          person.email, 'registration', v_registration.id,
          jsonb_build_object('activity_id', v_activity.id,
            'activity_slug', v_activity.slug, 'activity_title', v_activity.title,
            'activity_type', v_activity.type,
            'registration_code', v_registration.registration_code,
            'registration_status', 'confirmed', 'group_request_code',
            v_result->>'request_code')
        from public.people person where person.id = v_registration.person_id;
      end if;
    end if;
  end loop;
  if v_free_count = v_attendee_count then
    update public.member_group_requests set billing_type = null,
      billing_document = null, billing_name = null, billing_address = null
    where id = v_group_id;
    update public.notification_outbox set
      event_type = 'activity_free_registration_confirmed',
      related_entity_type = 'registration',
      related_entity_id = (
        select registration.id from public.registrations registration
        where registration.member_group_request_id = v_group_id
        order by registration.registration_code limit 1),
      payload = payload || jsonb_build_object('registration_code',
        (select registration.registration_code from public.registrations registration
          where registration.member_group_request_id = v_group_id
          order by registration.registration_code limit 1),
        'registration_status', 'confirmed', 'group_total', 0)
    where event_type = 'activity_group_request_received'
      and related_entity_id = v_group_id;
  else
    update public.notification_outbox set payload = payload ||
      jsonb_build_object('group_total', v_activity.member_price *
        (v_attendee_count - v_free_count), 'group_complimentary_count', v_free_count)
    where event_type = 'activity_group_request_received'
      and related_entity_id = v_group_id;
  end if;
  perform public.sync_activity_virtual_reminders(p_activity_id);
  return public.get_member_group_result(
    v_result->>'request_code', (v_result->>'access_token')::uuid)
    || jsonb_build_object('access_token', v_result->>'access_token', 'replayed', false);
end;
$$;
revoke execute on function public.register_member_group(uuid, jsonb, uuid) from public;
grant execute on function public.register_member_group(uuid, jsonb, uuid)
  to anon, authenticated, service_role;

create or replace function public.get_member_group_result(
  p_request_code text, p_access_token uuid
)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'request_id', request.id, 'request_code', request.request_code,
    'activity_slug', activity.slug, 'activity_title', activity.title,
    'activity_type', activity.type, 'company_ruc', request.company_ruc,
    'company_name', request.company_name_snapshot, 'is_free', request.is_free_snapshot,
    'total', coalesce(sum(registration.price_snapshot) filter
      (where registration.status <> 'cancelled' and registration.deleted_at is null), 0),
    'confirmed_amount', coalesce(sum(registration.price_snapshot) filter
      (where registration.status = 'confirmed' and registration.deleted_at is null), 0),
    'pending_amount', coalesce(sum(registration.price_snapshot) filter
      (where registration.status = 'pending' and registration.deleted_at is null), 0),
    'confirmed_count', count(registration.id) filter
      (where registration.status = 'confirmed' and registration.deleted_at is null),
    'pending_count', count(registration.id) filter
      (where registration.status = 'pending' and registration.deleted_at is null),
    'complimentary_count', count(registration.id) filter
      (where registration.is_complimentary and registration.status <> 'cancelled'
        and registration.deleted_at is null),
    'contact_whatsapp_phone', coalesce(contact.whatsapp_phone, activity.contact_phone),
    'attendees', coalesce(jsonb_agg(jsonb_build_object(
      'first_names', registration.first_names_snapshot,
      'last_names', registration.last_names_snapshot,
      'registration_code', registration.registration_code,
      'status', registration.status, 'price', registration.price_snapshot,
      'is_complimentary', registration.is_complimentary)
      order by registration.registration_code)
      filter (where registration.id is not null and registration.deleted_at is null), '[]'::jsonb)
  )
  from public.member_group_requests request
  join public.activities activity on activity.id = request.activity_id
  left join public.registrations registration on registration.member_group_request_id = request.id
  left join public.activity_contacts contact on contact.id = activity.contact_id
    and contact.deleted_at is null
  where request.request_code = p_request_code and request.access_token = p_access_token
    and activity.deleted_at is null and activity.status <> 'archived'
  group by request.id, activity.id, contact.id;
$$;

alter function public.list_member_group_requests(text, uuid, text, integer, integer)
  rename to list_member_group_requests_without_passes;
revoke execute on function public.list_member_group_requests_without_passes(text, uuid, text, integer, integer)
  from public, anon, authenticated, service_role;

create or replace function public.list_member_group_requests(
  p_query text default null,
  p_activity_id uuid default null,
  p_status text default null,
  p_page integer default 1,
  p_page_size integer default 20
)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  v_result jsonb;
  v_items jsonb;
begin
  v_result := public.list_member_group_requests_without_passes(
    p_query, p_activity_id, p_status, p_page, p_page_size);
  select coalesce(jsonb_agg(item.value || jsonb_build_object(
    'complimentary_quota', activity.member_free_passes_per_company,
    'complimentary_used', (select count(*) from public.member_complimentary_passes pass
      where pass.activity_id = activity.id
        and pass.company_ruc = item.value->>'company_ruc'))
    order by item.ordinality), '[]'::jsonb) into v_items
  from jsonb_array_elements(v_result->'items') with ordinality as item(value, ordinality)
  join public.activities activity on activity.id = (item.value->>'activity_id')::uuid;
  return jsonb_set(v_result, '{items}', v_items);
end;
$$;
revoke execute on function public.list_member_group_requests(text, uuid, text, integer, integer)
  from public, anon;
grant execute on function public.list_member_group_requests(text, uuid, text, integer, integer)
  to authenticated, service_role;

-- The payment operation already requires a pending seat with a positive snapshot.

create or replace function public.transfer_member_complimentary_pass(
  p_pass_id uuid, p_target_registration_id uuid, p_reason text
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_activity_id uuid;
  v_pass public.member_complimentary_passes%rowtype;
  v_source public.registrations%rowtype;
  v_target public.registrations%rowtype;
begin
  if not public.is_internal_user() then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;
  if p_pass_id is null or p_target_registration_id is null
    or length(btrim(coalesce(p_reason, ''))) not between 2 and 500 then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;
  select pass.activity_id into v_activity_id
    from public.member_complimentary_passes pass where pass.id = p_pass_id;
  if not found then raise exception 'PASS_NOT_FOUND' using errcode = 'P0001'; end if;
  perform 1 from public.activities activity where activity.id = v_activity_id
    and activity.deleted_at is null and activity.status = 'published' for update;
  if not found then raise exception 'ACTIVITY_NOT_AVAILABLE' using errcode = 'P0001'; end if;
  select * into v_pass from public.member_complimentary_passes
    where id = p_pass_id for update;
  select * into v_source from public.registrations
    where id = v_pass.registration_id for update;
  select * into v_target from public.registrations
    where id = p_target_registration_id for update;
  if v_source.status <> 'cancelled' or not v_source.is_complimentary
    or not found or v_target.status <> 'pending' or v_target.deleted_at is not null
    or v_target.price_snapshot <= 0 or v_target.is_complimentary
    or v_target.activity_id <> v_pass.activity_id
    or v_target.ruc_snapshot <> v_pass.company_ruc
    or v_target.member_group_request_id is null
    or exists (select 1 from public.member_group_payment_allocations allocation
      where allocation.registration_id = v_target.id)
    or exists (select 1 from public.attendance attendance
      where attendance.registration_id in (v_source.id, v_target.id)
        and attendance.status <> 'pending')
    or exists (select 1 from public.certificates certificate
      where certificate.registration_id in (v_source.id, v_target.id)
        and certificate.status = 'issued')
  then
    raise exception 'PASS_TRANSFER_NOT_ALLOWED' using errcode = 'P0001';
  end if;
  update public.member_complimentary_passes set
    registration_id = v_target.id, transferred_at = now()
  where id = v_pass.id;
  update public.registrations set price_snapshot = 0,
    is_complimentary = true, status = 'confirmed', confirmed_at = now(),
    confirmed_by = auth.uid()
  where id = v_target.id;
  insert into public.audit_logs(
    actor_user_id, action, entity_type, entity_id, old_data, new_data, metadata)
  values (
    auth.uid(), 'member_group.complimentary_pass_transferred',
    'member_complimentary_pass', v_pass.id,
    jsonb_build_object('registration_id', v_source.id),
    jsonb_build_object('registration_id', v_target.id),
    jsonb_build_object('reason', btrim(p_reason), 'old_price', v_target.price_snapshot,
      'new_price', 0));
  insert into public.notification_outbox(
    person_id, event_type, recipient_email, related_entity_type,
    related_entity_id, payload)
  select v_target.person_id, 'activity_free_registration_confirmed', person.email,
    'registration', v_target.id,
    jsonb_build_object('activity_id', activity.id, 'activity_slug', activity.slug,
      'activity_title', activity.title, 'activity_type', activity.type,
      'registration_code', v_target.registration_code,
      'registration_status', 'confirmed', 'group_request_code', request.request_code)
  from public.people person
  join public.activities activity on activity.id = v_target.activity_id
  join public.member_group_requests request on request.id = v_target.member_group_request_id
  where person.id = v_target.person_id
  on conflict (event_type, related_entity_type, related_entity_id)
    where deleted_at is null and related_entity_id is not null do nothing;
  perform public.sync_activity_virtual_reminders(v_target.activity_id);
  return jsonb_build_object('pass_id', v_pass.id,
    'source_registration_id', v_source.id,
    'target_registration_id', v_target.id);
end;
$$;
revoke execute on function public.transfer_member_complimentary_pass(uuid, uuid, text)
  from public, anon;
grant execute on function public.transfer_member_complimentary_pass(uuid, uuid, text)
  to authenticated, service_role;

alter function public.cancel_registration(uuid, text)
  rename to cancel_registration_without_pass_notice;
revoke execute on function public.cancel_registration_without_pass_notice(uuid, text)
  from public, anon, authenticated, service_role;

create or replace function public.cancel_registration(
  p_registration_id uuid, p_reason text default null
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_before public.registrations%rowtype;
  v_result jsonb;
begin
  if not public.is_active_admin() then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;
  select * into v_before from public.registrations
    where id = p_registration_id for update;
  v_result := public.cancel_registration_without_pass_notice(p_registration_id, p_reason);
  if coalesce((v_result->>'changed')::boolean, false)
    and v_before.is_complimentary then
    insert into public.notification_outbox(
      person_id, event_type, recipient_email, related_entity_type,
      related_entity_id, payload)
    select v_before.person_id, 'activity_registration_cancelled', person.email,
      'registration', v_before.id,
      jsonb_build_object('activity_id', activity.id,
        'activity_slug', activity.slug, 'activity_title', activity.title,
        'activity_type', activity.type,
        'registration_code', v_before.registration_code,
        'registration_status', 'cancelled')
    from public.people person
    join public.activities activity on activity.id = v_before.activity_id
    where person.id = v_before.person_id
    on conflict (event_type, related_entity_type, related_entity_id)
      where deleted_at is null and related_entity_id is not null do nothing;
  end if;
  return v_result;
end;
$$;
revoke execute on function public.cancel_registration(uuid, text) from public, anon;
grant execute on function public.cancel_registration(uuid, text)
  to authenticated, service_role;
