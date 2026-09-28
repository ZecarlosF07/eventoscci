-- One operational payment workspace per activity; historical confirmations remain intact.
create table public.individual_registration_payments (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null unique references public.registrations(id),
  amount numeric(10,2) not null check (amount > 0),
  payment_reference text not null check (length(btrim(payment_reference)) between 2 and 150),
  note text check (length(note) <= 500),
  verified_by uuid not null references auth.users(id),
  verified_at timestamptz not null default now(),
  idempotency_key uuid not null unique,
  request_hash text not null
);
alter table public.individual_registration_payments enable row level security;
revoke all on public.individual_registration_payments from public, anon, authenticated;
grant select on public.individual_registration_payments to authenticated;
grant all on public.individual_registration_payments to service_role;
create policy individual_payments_internal_read on public.individual_registration_payments
  for select to authenticated using (public.is_internal_user());

create or replace function public.confirm_registration(p_registration_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_registration public.registrations%rowtype;
begin
  if not public.is_internal_user() then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  select * into v_registration from public.registrations where id = p_registration_id for update;
  if v_registration.member_group_request_id is not null then
    raise exception 'GROUP_CONFIRMATION_REQUIRES_PAYMENT_OPERATION' using errcode = 'P0001';
  end if;
  if v_registration.status = 'pending' and v_registration.price_snapshot > 0
    and not exists (select 1 from public.individual_registration_payments where registration_id = p_registration_id)
  then raise exception 'INDIVIDUAL_CONFIRMATION_REQUIRES_PAYMENT_OPERATION' using errcode = 'P0001'; end if;
  return public.confirm_registration_individual(p_registration_id);
end; $$;

create function public.verify_individual_registration_payment(
  p_registration_id uuid, p_received_amount numeric, p_payment_reference text,
  p_note text, p_idempotency_key uuid
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_registration public.registrations%rowtype;
  v_payment public.individual_registration_payments%rowtype;
  v_hash text := md5(jsonb_build_object('registration', p_registration_id,
    'amount', p_received_amount, 'reference', btrim(p_payment_reference),
    'note', nullif(btrim(p_note), ''))::text);
begin
  if not public.is_internal_user() then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  if p_registration_id is null or p_idempotency_key is null
    or p_received_amount is null or p_received_amount <= 0 or p_received_amount::text = 'NaN'
    or length(btrim(coalesce(p_payment_reference, ''))) not between 2 and 150
    or length(coalesce(p_note, '')) > 500
  then raise exception 'VALIDATION_ERROR' using errcode = '22023'; end if;
  perform pg_advisory_xact_lock(hashtext(p_idempotency_key::text));
  select * into v_payment from public.individual_registration_payments where idempotency_key = p_idempotency_key;
  if found then
    if v_payment.request_hash <> v_hash then raise exception 'IDEMPOTENCY_KEY_REUSED' using errcode = 'P0001'; end if;
    return jsonb_build_object('payment_id', v_payment.id, 'replayed', true);
  end if;
  select * into v_registration from public.registrations where id = p_registration_id for update;
  if not found or v_registration.deleted_at is not null or v_registration.status <> 'pending'
    or v_registration.member_group_request_id is not null or v_registration.is_complimentary
    or v_registration.price_snapshot <= 0
    or not exists (select 1 from public.activities where id = v_registration.activity_id
      and deleted_at is null and status in ('published', 'finished'))
    or not exists (select 1 from public.people where id = v_registration.person_id and deleted_at is null)
  then raise exception 'INVALID_PAYMENT_SELECTION' using errcode = 'P0001'; end if;
  if p_received_amount <> v_registration.price_snapshot then
    raise exception 'PAYMENT_AMOUNT_MISMATCH' using errcode = 'P0001';
  end if;
  insert into public.individual_registration_payments(registration_id, amount, payment_reference,
    note, verified_by, idempotency_key, request_hash)
  values (p_registration_id, p_received_amount, btrim(p_payment_reference),
    nullif(btrim(p_note), ''), auth.uid(), p_idempotency_key, v_hash) returning * into v_payment;
  perform public.confirm_registration(p_registration_id);
  insert into public.audit_logs(actor_user_id, action, entity_type, entity_id, new_data)
  values (auth.uid(), 'registration.individual_payment_verified', 'individual_registration_payment',
    v_payment.id, to_jsonb(v_payment) - 'request_hash');
  return jsonb_build_object('payment_id', v_payment.id, 'replayed', false);
end; $$;
revoke all on function public.verify_individual_registration_payment(uuid, numeric, text, text, uuid) from public, anon;
grant execute on function public.verify_individual_registration_payment(uuid, numeric, text, text, uuid) to authenticated;

-- Each key is a group request or an individual registration, never a person count.
create view public.participation_payment_requests with (security_invoker = true) as
with seats as (
  select r.*, p.document_number, p.email, p.first_names, p.last_names,
    g.request_code, g.company_name_snapshot as group_company, g.company_ruc,
    g.billing_document, g.coordinator_person_id,
    coalesce(g.id, r.id) as request_id,
    case when g.id is null then 'individual' else 'group' end as request_kind,
    coalesce(i.amount, allocation.amount, 0) as validated_amount
  from public.registrations r
  join public.activities a on a.id = r.activity_id and a.deleted_at is null and a.status <> 'archived'
  join public.people p on p.id = r.person_id and p.deleted_at is null
  left join public.member_group_requests g on g.id = r.member_group_request_id
  left join public.individual_registration_payments i on i.registration_id = r.id
  left join public.member_group_payment_allocations allocation on allocation.registration_id = r.id
  where r.deleted_at is null
)
select request_id as id, activity_id, request_kind as kind,
  coalesce(max(request_code), max(registration_code)) as code,
  coalesce(max(group_company), max(first_names || ' ' || last_names)) as name,
  coalesce(max(company_ruc), max(ruc_snapshot)) as company_ruc,
  string_agg(concat_ws(' ', registration_code, request_code, first_names, last_names,
    first_names_snapshot, last_names_snapshot, document_number, email, company_ruc,
    ruc_snapshot, billing_document, group_company), ' ') as search_text,
  min(created_at) as created_at,
  count(*) filter (where status <> 'cancelled')::integer as seat_count,
  count(*) filter (where status = 'pending' and price_snapshot > 0 and not is_complimentary)::integer as pending_count,
  coalesce(sum(price_snapshot) filter (where status = 'pending' and price_snapshot > 0 and not is_complimentary), 0) as pending_amount,
  coalesce(sum(validated_amount), 0) as validated_amount,
  coalesce(sum(price_snapshot) filter (where status = 'confirmed' and price_snapshot > 0 and validated_amount = 0), 0) as legacy_amount,
  count(*) filter (where is_complimentary and status <> 'cancelled')::integer as complimentary_count,
  case when bool_and(status = 'cancelled') then 'cancelled'
    when bool_or(status = 'pending' and price_snapshot > 0 and not is_complimentary)
      then case when bool_or(status = 'confirmed') then 'partial' else 'pending' end
    else 'complete' end as status
from seats group by request_id, activity_id, request_kind;

create view public.certificate_payment_requests with (security_invoker = true) as
select r.id, r.activity_id, r.registration_code as code,
  p.first_names || ' ' || p.last_names as name, p.email, p.phone,
  concat_ws(' ', r.registration_code, p.first_names, p.last_names, p.document_number, r.ruc_snapshot) as search_text,
  r.certificate_requested_at as created_at, r.certificate_price_snapshot as price,
  r.status as registration_status, r.certificate_payment_verified_at as verified_at,
  r.certificate_payment_verified_by as verified_by,
  exists (select 1 from public.certificates c where c.registration_id = r.id and c.deleted_at is null) as issued,
  case when r.certificate_payment_verified_at is not null then 'complete' else 'pending' end as status,
  case when r.certificate_payment_verified_at is null then r.certificate_price_snapshot else 0 end as pending_amount
from public.registrations r
join public.activities a on a.id = r.activity_id and a.deleted_at is null and a.status <> 'archived'
  and a.certificate_mode = 'optional_paid'
join public.people p on p.id = r.person_id and p.deleted_at is null
where r.deleted_at is null and r.status <> 'cancelled'
  and r.certificate_mode_snapshot = 'optional_paid' and r.certificate_requested_at is not null;

alter view public.activity_participation_summary rename to activity_participation_base;
create view public.activity_participation_summary with (security_invoker = true) as
select base.*, dates.operational_ends_at,
  coalesce(dates.operational_ends_at > now() and base.status not in ('finished', 'cancelled'), false) as is_operational_upcoming,
  coalesce(payments.requests, 0)::integer as payment_pending_requests,
  coalesce(payments.seats, 0)::integer as payment_pending_seats,
  coalesce(certificates.requests, 0)::integer as certificate_pending_count,
  coalesce(certificates.amount, 0) as certificate_pending_amount
from public.activity_participation_base base
left join lateral (
  select max(coalesce(d.ends_at,
    ((d.starts_at at time zone 'America/Lima')::date + 1)::timestamp at time zone 'America/Lima')) as operational_ends_at
  from public.activity_dates d where d.activity_id = base.activity_id and d.deleted_at is null
) dates on true
left join lateral (
  select count(*) filter (where pending_count > 0) as requests, sum(pending_count) as seats
  from public.participation_payment_requests where activity_id = base.activity_id
) payments on true
left join lateral (
  select count(*) filter (where status = 'pending') as requests, sum(pending_amount) as amount
  from public.certificate_payment_requests where activity_id = base.activity_id
) certificates on true;

create view public.participation_global_metrics with (security_invoker = true) as
select coalesce(sum(active_count), 0) as active, coalesce(sum(attended_count), 0) as attended,
  coalesce(sum(confirmed_count), 0) as confirmed, coalesce(sum(payment_pending_seats), 0) as pending
from public.activity_participation_summary;
revoke all on public.participation_payment_requests, public.certificate_payment_requests,
  public.activity_participation_summary, public.participation_global_metrics from public, anon;
grant select on public.participation_payment_requests, public.certificate_payment_requests,
  public.activity_participation_summary, public.participation_global_metrics to authenticated, service_role;
