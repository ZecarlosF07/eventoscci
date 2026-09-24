-- Hito 15: public group submission/result and audited manual payment allocation.

create or replace function public.get_member_group_result(
  p_request_code text,
  p_access_token uuid
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'request_id', request.id,
    'request_code', request.request_code,
    'activity_slug', activity.slug,
    'activity_title', activity.title,
    'activity_type', activity.type,
    'company_ruc', request.company_ruc,
    'company_name', request.company_name_snapshot,
    'is_free', request.is_free_snapshot,
    'total', coalesce(sum(registration.price_snapshot) filter (
      where registration.status <> 'cancelled' and registration.deleted_at is null
    ), 0),
    'confirmed_amount', coalesce(sum(registration.price_snapshot) filter (
      where registration.status = 'confirmed' and registration.deleted_at is null
    ), 0),
    'pending_amount', coalesce(sum(registration.price_snapshot) filter (
      where registration.status = 'pending' and registration.deleted_at is null
    ), 0),
    'confirmed_count', count(registration.id) filter (
      where registration.status = 'confirmed' and registration.deleted_at is null
    ),
    'pending_count', count(registration.id) filter (
      where registration.status = 'pending' and registration.deleted_at is null
    ),
    'contact_whatsapp_phone', coalesce(contact.whatsapp_phone, activity.contact_phone),
    'attendees', coalesce(jsonb_agg(jsonb_build_object(
      'first_names', registration.first_names_snapshot,
      'last_names', registration.last_names_snapshot,
      'registration_code', registration.registration_code,
      'status', registration.status,
      'price', registration.price_snapshot
    ) order by registration.created_at, registration.id)
      filter (where registration.id is not null and registration.deleted_at is null), '[]'::jsonb)
  )
  from public.member_group_requests request
  join public.activities activity on activity.id = request.activity_id
  left join public.registrations registration on registration.member_group_request_id = request.id
  left join public.activity_contacts contact on contact.id = activity.contact_id and contact.deleted_at is null
  where request.request_code = p_request_code
    and request.access_token = p_access_token
    and activity.deleted_at is null
    and activity.status <> 'archived'
  group by request.id, activity.id, contact.id;
$$;

revoke execute on function public.get_member_group_result(text, uuid) from public;
grant execute on function public.get_member_group_result(text, uuid)
  to anon, authenticated, service_role;

create table public.member_group_submission_limits (
  company_ruc text primary key references public.member_companies(ruc) on delete cascade,
  window_started_at timestamptz not null default now(),
  attempts integer not null default 0 check (attempts >= 0)
);
alter table public.member_group_submission_limits enable row level security;
revoke all on public.member_group_submission_limits from public, anon, authenticated;
grant all on public.member_group_submission_limits to service_role;

create or replace function public.register_member_group(
  p_activity_id uuid,
  p_request jsonb,
  p_idempotency_key uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_activity public.activities%rowtype;
  v_attendee jsonb;
  v_billing jsonb := p_request->'billing';
  v_billing_type text := nullif(btrim(p_request->'billing'->>'type'), '');
  v_company public.member_companies%rowtype;
  v_contact_email text;
  v_count integer := 0;
  v_coordinator_registration_id uuid;
  v_document_number text;
  v_document_type text;
  v_email text;
  v_first_names text;
  v_group public.member_group_requests%rowtype;
  v_job_title text;
  v_last_names text;
  v_name_list jsonb := '[]'::jsonb;
  v_old_person public.people%rowtype;
  v_person_id uuid;
  v_phone text;
  v_price numeric(10, 2);
  v_registration_id uuid;
  v_registration_code text;
  v_request_hash text := md5(p_request::text);
  v_ruc text := btrim(p_request->>'ruc');
  v_status public.registration_status;
  v_suggestion text := nullif(btrim(p_request->>'future_topics_suggestion'), '');
  v_wants_certificate boolean;
  v_submissions integer;
begin
  if p_activity_id is null or p_request is null or p_idempotency_key is null
    or jsonb_typeof(p_request->'attendees') <> 'array'
    or jsonb_array_length(p_request->'attendees') not between 1 and 500
  then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_idempotency_key::text));
  select * into v_group from public.member_group_requests
  where idempotency_key = p_idempotency_key;
  if found then
    if v_group.activity_id <> p_activity_id or v_group.request_hash <> v_request_hash then
      raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode = 'P0001';
    end if;
    return public.get_member_group_result(v_group.request_code, v_group.access_token)
      || jsonb_build_object('access_token', v_group.access_token, 'replayed', true);
  end if;

  select * into v_activity from public.activities where id = p_activity_id for update;
  if not found or v_activity.deleted_at is not null
    or v_activity.type <> 'event' or not v_activity.members_only
    or v_activity.status <> 'published' or v_activity.published_at is null
  then
    raise exception 'ACTIVITY_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_activity.registrations_closed_manually
    or (v_activity.registration_open_at is not null and now() < v_activity.registration_open_at)
    or (v_activity.registration_close_at is not null and now() > v_activity.registration_close_at)
    or exists (
      select 1 from public.activity_dates activity_date
      where activity_date.activity_id = v_activity.id
        and activity_date.deleted_at is null
      group by activity_date.activity_id
      having max(coalesce(activity_date.ends_at, activity_date.starts_at)) <= now()
    )
  then
    raise exception 'REGISTRATION_CLOSED' using errcode = 'P0001';
  end if;
  if not v_activity.is_free and v_activity.member_price <= 0 then
    raise exception 'INVALID_MEMBER_PRICE' using errcode = '22023';
  end if;
  if v_activity.capacity is not null and (
    select count(*) from public.registrations registration
    where registration.activity_id = v_activity.id
      and registration.status in ('pending', 'confirmed')
      and registration.deleted_at is null
  ) + jsonb_array_length(p_request->'attendees') > v_activity.capacity then
    raise exception 'NO_AVAILABLE_CAPACITY' using errcode = 'P0001';
  end if;

  select * into v_company from public.member_companies
  where ruc = v_ruc and is_active;
  if not found then
    raise exception 'MEMBER_RUC_INACTIVE' using errcode = 'P0001';
  end if;
  insert into public.member_group_submission_limits(company_ruc, attempts)
  values (v_company.ruc, 1)
  on conflict (company_ruc) do update set
    window_started_at = case when member_group_submission_limits.window_started_at < now() - interval '1 hour'
      then now() else member_group_submission_limits.window_started_at end,
    attempts = case when member_group_submission_limits.window_started_at < now() - interval '1 hour'
      then 1 else member_group_submission_limits.attempts + 1 end
  returning attempts into v_submissions;
  if v_submissions > 20 then
    raise exception 'GROUP_RATE_LIMITED' using errcode = 'P0001';
  end if;
  if v_suggestion is not null and length(v_suggestion) > 500 then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;
  if v_activity.is_free then
    if v_billing_type is not null then
      raise exception 'INVALID_BILLING' using errcode = '22023';
    end if;
  elsif (v_billing_type = 'boleta' and (
      not coalesce((v_billing->>'document') ~ '^[0-9]{8}$', false)
      or length(btrim(coalesce(v_billing->>'name', ''))) not between 2 and 250
    )) or (v_billing_type = 'factura' and (
      not coalesce((v_billing->>'document') ~ '^[0-9]{11}$', false)
      or length(btrim(coalesce(v_billing->>'name', ''))) not between 2 and 250
      or length(btrim(coalesce(v_billing->>'address', ''))) not between 2 and 250
    )) or v_billing_type is null or v_billing_type not in ('boleta', 'factura') then
    raise exception 'INVALID_BILLING' using errcode = '22023';
  end if;

  insert into public.member_group_requests(
    activity_id, company_ruc, company_name_snapshot, is_free_snapshot, request_code,
    idempotency_key, request_hash, billing_type, billing_document,
    billing_name, billing_address, future_topics_suggestion
  ) values (
    v_activity.id, v_company.ruc, v_company.legal_name, v_activity.is_free,
    concat('CCI-GR-', lpad(nextval('public.member_group_request_code_seq'::regclass)::text, 6, '0')),
    p_idempotency_key, v_request_hash, v_billing_type,
    case when v_activity.is_free then null else btrim(v_billing->>'document') end,
    case when v_activity.is_free then null else btrim(v_billing->>'name') end,
    case when v_activity.is_free or v_billing_type = 'boleta' then null
      else btrim(v_billing->>'address') end,
    v_suggestion
  ) returning * into v_group;

  v_status := case when v_activity.is_free then 'confirmed' else 'pending' end;
  v_price := case when v_activity.is_free then 0 else v_activity.member_price end;
  select coalesce(contact.email, v_activity.contact_email) into v_contact_email
  from public.activities activity
  left join public.activity_contacts contact
    on contact.id = activity.contact_id and contact.deleted_at is null
  where activity.id = v_activity.id;

  for v_attendee in select value from jsonb_array_elements(p_request->'attendees') as item(value) loop
    v_count := v_count + 1;
    v_document_type := lower(btrim(v_attendee->>'document_type'));
    v_document_number := upper(btrim(v_attendee->>'document_number'));
    v_first_names := btrim(v_attendee->>'first_names');
    v_last_names := btrim(v_attendee->>'last_names');
    v_email := lower(btrim(v_attendee->>'email'));
    v_phone := regexp_replace(btrim(v_attendee->>'phone'), '[[:space:]-]', '', 'g');
    v_job_title := btrim(v_attendee->>'job_title');
    v_wants_certificate := lower(coalesce(v_attendee->>'request_certificate', 'false')) in ('true', '1');

    if v_document_type is null or v_document_type not in ('dni', 'ce')
      or v_document_number is null
      or (v_document_type = 'dni' and v_document_number !~ '^[0-9]{8}$')
      or (v_document_type = 'ce' and v_document_number !~ '^[A-Z0-9]{6,20}$')
      or coalesce(length(v_first_names) between 2 and 120, false) is false
      or coalesce(length(v_last_names) between 2 and 120, false) is false
      or v_email is null or length(v_email) > 320
      or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
      or v_phone is null or v_phone !~ '^\+?[0-9]{7,15}$'
      or coalesce(length(v_job_title) between 2 and 150, false) is false
    then
      raise exception 'INVALID_ATTENDEE' using errcode = '22023';
    end if;

    select * into v_old_person from public.people person
    where person.document_type::text = v_document_type
      and person.document_number = v_document_number
    for update;

    if found then
      v_person_id := v_old_person.id;
      update public.people set
        first_names = v_first_names, last_names = v_last_names,
        email = v_email, phone = v_phone,
        participant_profile = 'professional', job_title = v_job_title,
        company = v_group.company_name_snapshot, ruc = v_group.company_ruc,
        deleted_at = null, deleted_by = null
      where id = v_person_id;
      if v_old_person.first_names is distinct from v_first_names
        or v_old_person.last_names is distinct from v_last_names
      then
        insert into public.audit_logs(
          actor_user_id, action, entity_type, entity_id, old_data, new_data, metadata
        ) values (
          null, 'participant.name_updated_by_member_group', 'person', v_person_id,
          jsonb_build_object('first_names', v_old_person.first_names,
            'last_names', v_old_person.last_names),
          jsonb_build_object('first_names', v_first_names, 'last_names', v_last_names),
          jsonb_build_object('request_id', v_group.id, 'document_type', v_document_type,
            'document_number', v_document_number)
        );
      end if;
    else
      insert into public.people(
        document_type, document_number, first_names, last_names, email, phone,
        participant_profile, job_title, company, ruc
      ) values (
        v_document_type::public.document_type, v_document_number,
        v_first_names, v_last_names, v_email, v_phone, 'professional',
        v_job_title, v_group.company_name_snapshot, v_group.company_ruc
      ) returning id into v_person_id;
    end if;

    if exists (select 1 from public.registrations registration
      where registration.activity_id = v_activity.id
        and registration.person_id = v_person_id and registration.deleted_at is null
        and registration.status in ('pending', 'confirmed'))
    then
      raise exception 'DUPLICATE_REGISTRATION' using errcode = '23505';
    end if;

    v_registration_code := concat('CCI-EV-',
      lpad(nextval('public.activity_registration_code_seq'::regclass)::text, 6, '0'));
    insert into public.registrations(
      activity_id, person_id, member_group_request_id, registration_code,
      registration_type, participant_profile, status, job_title_snapshot,
      company_snapshot, ruc_snapshot, future_topics_suggestion, price_snapshot,
      confirmed_at, certificate_requested_at
    ) values (
      v_activity.id, v_person_id, v_group.id, v_registration_code,
      'member', 'professional', v_status, v_job_title,
      v_group.company_name_snapshot, v_group.company_ruc,
      case when v_count = 1 then v_suggestion else null end, v_price,
      case when v_activity.is_free then now() else null end,
      case when v_wants_certificate and v_activity.certificate_mode = 'optional_paid'
        then now() else null end
    ) returning id into v_registration_id;

    insert into public.attendance(registration_id) values (v_registration_id);
    v_name_list := v_name_list || jsonb_build_array(concat_ws(' ', v_first_names, v_last_names));

    if v_count = 1 then
      v_coordinator_registration_id := v_registration_id;
      update public.member_group_requests
      set coordinator_person_id = v_person_id, coordinator_email = v_email
      where id = v_group.id;
    end if;

    if v_activity.is_free then
      insert into public.notification_outbox(
        person_id, event_type, recipient_email, related_entity_type,
        related_entity_id, payload
      ) values (
        v_person_id, 'activity_free_registration_confirmed', v_email,
        'registration', v_registration_id,
        jsonb_build_object('activity_id', v_activity.id, 'activity_slug', v_activity.slug,
          'activity_title', v_activity.title, 'activity_type', v_activity.type,
          'registration_code', v_registration_code, 'registration_status', v_status,
          'group_request_code', v_group.request_code)
      );
    end if;

    if v_wants_certificate and v_activity.certificate_mode = 'optional_paid'
      and v_contact_email is not null
    then
      insert into public.notification_outbox(
        person_id, event_type, recipient_email, related_entity_type,
        related_entity_id, payload
      ) values (
        v_person_id, 'activity_certificate_request_created', v_contact_email,
        'registration', v_registration_id,
        jsonb_build_object('activity_id', v_activity.id, 'activity_slug', v_activity.slug,
          'activity_title', v_activity.title, 'activity_type', v_activity.type,
          'participant_name', concat_ws(' ', v_first_names, v_last_names),
          'participant_phone', v_phone, 'registration_id', v_registration_id,
          'registration_code', v_registration_code, 'responsible_email', v_contact_email,
          'requested_at', now())
      );
    end if;
  end loop;

  if v_activity.is_free then
    update public.notification_outbox
    set payload = payload || jsonb_build_object('group_attendees', v_name_list,
      'group_request_code', v_group.request_code,
      'group_access_token', v_group.access_token)
    where event_type = 'activity_free_registration_confirmed'
      and related_entity_type = 'registration'
      and related_entity_id = v_coordinator_registration_id;
    perform public.sync_activity_virtual_reminders(v_activity.id);
  else
    insert into public.notification_outbox(
      person_id, event_type, recipient_email, related_entity_type,
      related_entity_id, payload
    ) values (
      (select coordinator_person_id from public.member_group_requests where id = v_group.id),
      'activity_group_request_received',
      (select coordinator_email from public.member_group_requests where id = v_group.id),
      'member_group_request', v_group.id,
      jsonb_build_object('activity_id', v_activity.id, 'activity_slug', v_activity.slug,
        'activity_title', v_activity.title, 'activity_type', v_activity.type,
        'group_request_code', v_group.request_code, 'group_attendees', v_name_list,
        'group_total', v_price * v_count,
        'group_access_token', v_group.access_token)
    );
  end if;

  return public.get_member_group_result(v_group.request_code, v_group.access_token)
    || jsonb_build_object('access_token', v_group.access_token, 'replayed', false);
exception
  when unique_violation then
    raise exception 'DUPLICATE_REGISTRATION' using errcode = '23505';
end;
$$;

revoke execute on function public.register_member_group(uuid, jsonb, uuid) from public;
grant execute on function public.register_member_group(uuid, jsonb, uuid)
  to anon, authenticated, service_role;

create or replace function public.verify_member_group_payment(
  p_request_id uuid,
  p_registration_ids uuid[],
  p_payment_reference text,
  p_received_amount numeric,
  p_note text,
  p_idempotency_key uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_amount numeric(10, 2);
  v_count integer;
  v_distinct_count integer;
  v_group public.member_group_requests%rowtype;
  v_hash text := md5(jsonb_build_object(
    'request_id', p_request_id, 'registration_ids', (
      select jsonb_agg(selected.id order by selected.id)
      from unnest(p_registration_ids) as selected(id)
    ), 'reference', btrim(p_payment_reference), 'received_amount', p_received_amount,
    'note', nullif(btrim(p_note), '')
  )::text);
  v_payment public.member_group_payments%rowtype;
begin
  if not public.is_internal_user() then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;
  if p_idempotency_key is null or p_request_id is null
    or coalesce(cardinality(p_registration_ids), 0) < 1
    or length(btrim(coalesce(p_payment_reference, ''))) not between 2 and 150
    or p_received_amount is null or p_received_amount <= 0
    or length(coalesce(p_note, '')) > 500
  then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_idempotency_key::text));
  select * into v_payment from public.member_group_payments
  where idempotency_key = p_idempotency_key;
  if found then
    if v_payment.request_id <> p_request_id or v_payment.request_hash <> v_hash then
      raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode = 'P0001';
    end if;
    return jsonb_build_object('payment_id', v_payment.id, 'amount', v_payment.amount,
      'registration_ids', p_registration_ids, 'replayed', true);
  end if;

  select * into v_group from public.member_group_requests where id = p_request_id for update;
  if not found then raise exception 'GROUP_NOT_FOUND' using errcode = 'P0001'; end if;
  if v_group.is_free_snapshot or exists (select 1 from public.activities activity
    where activity.id = v_group.activity_id
      and (activity.status = 'archived' or activity.deleted_at is not null))
  then raise exception 'GROUP_NOT_PAYABLE' using errcode = 'P0001'; end if;

  select count(*), count(distinct selected.id) into v_count, v_distinct_count
  from unnest(p_registration_ids) as selected(id);
  if v_count <> v_distinct_count then
    raise exception 'DUPLICATE_SELECTION' using errcode = '22023';
  end if;

  perform 1 from public.registrations registration
  where registration.id = any(p_registration_ids) order by registration.id for update;
  select count(*), coalesce(sum(price_snapshot), 0) into v_count, v_amount
  from public.registrations registration
  where registration.id = any(p_registration_ids)
    and registration.member_group_request_id = v_group.id
    and registration.status = 'pending' and registration.deleted_at is null
    and registration.price_snapshot > 0;
  if v_count <> cardinality(p_registration_ids) or v_amount <= 0 then
    raise exception 'INVALID_PAYMENT_SELECTION' using errcode = 'P0001';
  end if;
  if v_amount <> p_received_amount then
    raise exception 'PAYMENT_AMOUNT_MISMATCH' using errcode = 'P0001';
  end if;

  insert into public.member_group_payments(
    request_id, amount, payment_reference, note, idempotency_key,
    request_hash, verified_by
  ) values (
    v_group.id, v_amount, btrim(p_payment_reference), nullif(btrim(p_note), ''),
    p_idempotency_key, v_hash, auth.uid()
  ) returning * into v_payment;

  insert into public.member_group_payment_allocations(payment_id, registration_id, amount)
  select v_payment.id, registration.id, registration.price_snapshot
  from public.registrations registration
  where registration.id = any(p_registration_ids);

  update public.registrations registration set
    status = 'confirmed', confirmed_at = now(), confirmed_by = auth.uid()
  where registration.id = any(p_registration_ids);

  insert into public.audit_logs(actor_user_id, action, entity_type, entity_id,
    old_data, new_data, metadata)
  select auth.uid(), 'registration.confirmed_by_member_group_payment',
    'registration', registration.id,
    jsonb_build_object('status', 'pending'),
    jsonb_build_object('status', 'confirmed', 'confirmed_at', registration.confirmed_at),
    jsonb_build_object('payment_id', v_payment.id, 'request_id', v_group.id)
  from public.registrations registration
  where registration.id = any(p_registration_ids);

  insert into public.notification_outbox(
    person_id, event_type, recipient_email, related_entity_type,
    related_entity_id, payload
  )
  select registration.person_id, 'activity_paid_registration_confirmed', person.email,
    'registration', registration.id,
    jsonb_build_object('activity_id', activity.id, 'activity_slug', activity.slug,
      'activity_title', activity.title, 'activity_type', activity.type,
      'registration_code', registration.registration_code,
      'registration_status', registration.status)
  from public.registrations registration
  join public.people person on person.id = registration.person_id
  join public.activities activity on activity.id = registration.activity_id
  where registration.id = any(p_registration_ids)
  on conflict (event_type, related_entity_type, related_entity_id)
    where deleted_at is null and related_entity_id is not null do nothing;

  insert into public.audit_logs(actor_user_id, action, entity_type, entity_id, new_data)
  values (auth.uid(), 'member_group.payment_verified', 'member_group_payment', v_payment.id,
    jsonb_build_object('request_id', v_group.id, 'amount', v_amount,
      'registration_ids', p_registration_ids));
  perform public.sync_activity_virtual_reminders(v_group.activity_id);

  return jsonb_build_object('payment_id', v_payment.id, 'amount', v_amount,
    'registration_ids', p_registration_ids, 'replayed', false);
end;
$$;

revoke execute on function public.verify_member_group_payment(uuid, uuid[], text, numeric, text, uuid)
  from public, anon;
grant execute on function public.verify_member_group_payment(uuid, uuid[], text, numeric, text, uuid)
  to authenticated, service_role;
