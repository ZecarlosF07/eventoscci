-- Hito 15: atomic member-group registration and per-seat manual payments.

create sequence public.member_group_request_code_seq;

create table public.member_group_requests (
  id uuid primary key default extensions.gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete restrict,
  company_ruc text not null references public.member_companies(ruc) on delete restrict,
  company_name_snapshot text not null,
  is_free_snapshot boolean not null,
  coordinator_person_id uuid references public.people(id) on delete restrict,
  coordinator_email text,
  request_code text not null unique,
  access_token uuid not null default extensions.gen_random_uuid() unique,
  idempotency_key uuid not null unique,
  request_hash text not null,
  billing_type text check (billing_type in ('boleta', 'factura')),
  billing_document text,
  billing_name text,
  billing_address text,
  future_topics_suggestion text check (
    future_topics_suggestion is null or length(future_topics_suggestion) <= 500
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint member_group_requests_billing_check check (
    (billing_type is null and billing_document is null and billing_name is null and billing_address is null)
    or (billing_type = 'boleta' and coalesce(billing_document ~ '^[0-9]{8}$', false)
      and coalesce(length(btrim(billing_name)) between 2 and 250, false)
      and billing_address is null)
    or (billing_type = 'factura' and coalesce(billing_document ~ '^[0-9]{11}$', false)
      and coalesce(length(btrim(billing_name)) between 2 and 250, false)
      and coalesce(length(btrim(billing_address)) between 2 and 250, false))
  )
);

create index idx_member_group_requests_activity_created
  on public.member_group_requests(activity_id, created_at desc);
create index idx_member_group_requests_ruc_created
  on public.member_group_requests(company_ruc, created_at desc);
create trigger set_member_group_requests_updated_at before update on public.member_group_requests
  for each row execute function public.set_updated_at();

alter table public.registrations
  add column member_group_request_id uuid references public.member_group_requests(id) on delete restrict,
  add column first_names_snapshot text,
  add column last_names_snapshot text;

-- A cancelled seat remains in history but no longer prevents a new active request.
drop index public.uq_registration_person_activity_active;
create unique index uq_registration_person_activity_active
  on public.registrations(activity_id, person_id)
  where deleted_at is null and status in ('pending', 'confirmed');

update public.registrations registration
set first_names_snapshot = person.first_names,
    last_names_snapshot = person.last_names
from public.people person
where person.id = registration.person_id;

create index idx_registrations_member_group_request
  on public.registrations(member_group_request_id)
  where member_group_request_id is not null;

create or replace function public.snapshot_registration_names()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select person.first_names, person.last_names
  into new.first_names_snapshot, new.last_names_snapshot
  from public.people person where person.id = new.person_id;
  return new;
end;
$$;

create trigger snapshot_registration_names_before_insert
before insert on public.registrations
for each row execute function public.snapshot_registration_names();

create table public.member_group_payments (
  id uuid primary key default extensions.gen_random_uuid(),
  request_id uuid not null references public.member_group_requests(id) on delete restrict,
  amount numeric(10, 2) not null check (amount > 0),
  payment_reference text not null check (length(btrim(payment_reference)) between 2 and 150),
  note text check (note is null or length(note) <= 500),
  idempotency_key uuid not null unique,
  request_hash text not null,
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz not null default now()
);

create table public.member_group_payment_allocations (
  payment_id uuid not null references public.member_group_payments(id) on delete restrict,
  registration_id uuid not null unique references public.registrations(id) on delete restrict,
  amount numeric(10, 2) not null check (amount > 0),
  primary key (payment_id, registration_id)
);

create index idx_member_group_payments_request on public.member_group_payments(request_id, verified_at);

create or replace function public.protect_member_group_registration()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_activity public.activities%rowtype;
  v_group public.member_group_requests%rowtype;
begin
  select * into v_activity from public.activities where id = new.activity_id;
  if v_activity.type = 'event' and v_activity.members_only
    and new.member_group_request_id is null
  then
    raise exception 'EXCLUSIVE_EVENT_REQUIRES_GROUP' using errcode = 'P0001';
  end if;

  if tg_op = 'UPDATE' then
    if new.member_group_request_id is distinct from old.member_group_request_id then
      raise exception 'GROUP_MEMBERSHIP_IMMUTABLE' using errcode = 'P0001';
    end if;
    if old.member_group_request_id is not null
      and new.price_snapshot is distinct from old.price_snapshot then
      raise exception 'GROUP_PRICE_IMMUTABLE' using errcode = 'P0001';
    end if;
  end if;

  if new.member_group_request_id is null then return new; end if;
  select * into v_group from public.member_group_requests
  where id = new.member_group_request_id;
  if not found or v_group.activity_id <> new.activity_id
    or new.registration_type <> 'member'
    or new.ruc_snapshot <> v_group.company_ruc
  then
    raise exception 'INVALID_GROUP_REGISTRATION' using errcode = 'P0001';
  end if;

  if tg_op = 'UPDATE' then
    if old.status = 'pending' and new.status = 'confirmed'
      and new.price_snapshot > 0
      and not exists (
        select 1 from public.member_group_payment_allocations allocation
        where allocation.registration_id = new.id
      )
    then
      raise exception 'GROUP_PAYMENT_REQUIRED' using errcode = 'P0001';
    end if;
    if old.status = 'confirmed' and new.status = 'cancelled'
      and exists (
        select 1 from public.member_group_payment_allocations allocation
        where allocation.registration_id = new.id
      )
    then
      raise exception 'PAID_GROUP_SEAT_CANNOT_CANCEL' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

create trigger protect_member_group_registration_before_write
before insert or update on public.registrations
for each row execute function public.protect_member_group_registration();

create or replace function public.validate_member_group_payment_allocation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payment public.member_group_payments%rowtype;
  v_registration public.registrations%rowtype;
begin
  select * into v_payment from public.member_group_payments where id = new.payment_id;
  select * into v_registration from public.registrations where id = new.registration_id;
  if not found or v_payment.request_id <> v_registration.member_group_request_id
    or v_registration.status <> 'pending'
    or v_registration.deleted_at is not null
    or new.amount <> v_registration.price_snapshot
  then
    raise exception 'INVALID_PAYMENT_ALLOCATION' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger validate_member_group_payment_allocation_before_insert
before insert on public.member_group_payment_allocations
for each row execute function public.validate_member_group_payment_allocation();

-- The legacy confirmation operation must never serve as a group-payment shortcut.
alter function public.confirm_registration(uuid) rename to confirm_registration_individual;
revoke execute on function public.confirm_registration_individual(uuid)
  from public, anon, authenticated, service_role;

create or replace function public.confirm_registration(p_registration_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_internal_user() then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;
  if exists (select 1 from public.registrations registration
    where registration.id = p_registration_id
      and registration.member_group_request_id is not null)
  then
    raise exception 'GROUP_CONFIRMATION_REQUIRES_PAYMENT_OPERATION' using errcode = 'P0001';
  end if;
  return public.confirm_registration_individual(p_registration_id);
end;
$$;

revoke execute on function public.confirm_registration(uuid) from public, anon;
grant execute on function public.confirm_registration(uuid) to authenticated, service_role;

-- Reject exclusive events before the individual workflow can update people or seats.
alter function public.register_activity(uuid, jsonb) rename to register_activity_individual;
revoke execute on function public.register_activity_individual(uuid, jsonb)
  from public, anon, authenticated, service_role;

create or replace function public.register_activity(
  p_activity_id uuid,
  p_registration jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from public.activities activity
    where activity.id = p_activity_id and activity.type = 'event' and activity.members_only)
  then
    raise exception 'EXCLUSIVE_EVENT_REQUIRES_GROUP' using errcode = 'P0001';
  end if;
  return public.register_activity_individual(p_activity_id, p_registration);
end;
$$;

revoke execute on function public.register_activity(uuid, jsonb) from public;
grant execute on function public.register_activity(uuid, jsonb)
  to anon, authenticated, service_role;

alter table public.member_group_requests enable row level security;
alter table public.member_group_payments enable row level security;
alter table public.member_group_payment_allocations enable row level security;
revoke all on public.member_group_requests, public.member_group_payments,
  public.member_group_payment_allocations from public, anon, authenticated;
grant select on public.member_group_requests, public.member_group_payments,
  public.member_group_payment_allocations to authenticated;
grant all on public.member_group_requests, public.member_group_payments,
  public.member_group_payment_allocations to service_role;
grant usage, select on sequence public.member_group_request_code_seq to service_role;

create policy member_group_requests_internal_read on public.member_group_requests
  for select to authenticated using ((select public.is_internal_user()));
create policy member_group_payments_internal_read on public.member_group_payments
  for select to authenticated using ((select public.is_internal_user()));
create policy member_group_allocations_internal_read on public.member_group_payment_allocations
  for select to authenticated using ((select public.is_internal_user()));

revoke execute on function public.snapshot_registration_names(),
  public.protect_member_group_registration(),
  public.validate_member_group_payment_allocation()
  from public, anon, authenticated;
