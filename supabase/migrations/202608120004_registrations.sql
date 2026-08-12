create type public.registration_type as enum ('general', 'member');
create type public.registration_status as enum ('pending', 'confirmed', 'cancelled');
create type public.attendance_status as enum ('pending', 'attended', 'absent');
create type public.notification_status as enum (
  'pending',
  'processing',
  'sent',
  'failed',
  'cancelled'
);

create sequence public.activity_registration_code_seq;

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete restrict,
  person_id uuid not null references public.people(id) on delete restrict,
  registration_code varchar(40) not null unique,
  registration_type public.registration_type not null default 'general',
  status public.registration_status not null default 'pending',
  company_snapshot text,
  ruc_snapshot varchar(11),
  price_snapshot numeric(10, 2) not null default 0,
  confirmed_at timestamptz,
  confirmed_by uuid references auth.users(id) on delete set null,
  cancelled_at timestamptz,
  cancelled_by uuid references auth.users(id) on delete set null,
  cancellation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  constraint registrations_code_not_blank check (
    length(btrim(registration_code)) > 0
  ),
  constraint registrations_price_nonnegative check (price_snapshot >= 0),
  constraint registrations_ruc_format check (
    ruc_snapshot is null or ruc_snapshot ~ '^[0-9]{11}$'
  ),
  constraint registrations_member_snapshot check (
    registration_type <> 'member'
    or (
      company_snapshot is not null
      and length(btrim(company_snapshot)) > 0
      and ruc_snapshot is not null
    )
  ),
  constraint registrations_confirmation_consistency check (
    status <> 'confirmed' or confirmed_at is not null
  ),
  constraint registrations_cancellation_consistency check (
    status <> 'cancelled' or cancelled_at is not null
  ),
  constraint registrations_deleted_by_consistency check (
    deleted_at is not null or deleted_by is null
  )
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id) on delete cascade,
  status public.attendance_status not null default 'pending',
  marked_at timestamptz,
  marked_by uuid references auth.users(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  constraint attendance_mark_consistency check (
    status = 'pending' or marked_at is not null
  ),
  constraint attendance_deleted_by_consistency check (
    deleted_at is not null or deleted_by is null
  )
);

create table public.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references public.people(id) on delete set null,
  event_type text not null,
  recipient_email text not null,
  related_entity_type text,
  related_entity_id uuid,
  payload jsonb not null default '{}'::jsonb,
  status public.notification_status not null default 'pending',
  attempts integer not null default 0,
  next_attempt_at timestamptz,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  constraint notification_outbox_event_not_blank check (
    length(btrim(event_type)) > 0
  ),
  constraint notification_outbox_recipient_not_blank check (
    length(btrim(recipient_email)) > 0
  ),
  constraint notification_outbox_attempts_nonnegative check (attempts >= 0),
  constraint notification_outbox_deleted_by_consistency check (
    deleted_at is not null or deleted_by is null
  )
);

create unique index uq_registration_person_activity_active
on public.registrations(activity_id, person_id)
where deleted_at is null;

create index idx_registrations_activity_status
on public.registrations(activity_id, status)
where deleted_at is null;

create index idx_registrations_person
on public.registrations(person_id)
where deleted_at is null;

create unique index uq_attendance_registration_active
on public.attendance(registration_id)
where deleted_at is null;

create index idx_attendance_registration
on public.attendance(registration_id);

create unique index uq_notification_registration_event_active
on public.notification_outbox(event_type, related_entity_type, related_entity_id)
where deleted_at is null and related_entity_id is not null;

create index idx_notification_outbox_delivery
on public.notification_outbox(status, next_attempt_at)
where deleted_at is null;

create trigger set_registrations_updated_at
before update on public.registrations
for each row execute function public.set_updated_at();

create trigger set_attendance_updated_at
before update on public.attendance
for each row execute function public.set_updated_at();

create trigger set_notification_outbox_updated_at
before update on public.notification_outbox
for each row execute function public.set_updated_at();

alter table public.registrations enable row level security;
alter table public.attendance enable row level security;
alter table public.notification_outbox enable row level security;

revoke all on table public.registrations from anon, authenticated;
revoke all on table public.attendance from anon, authenticated;
revoke all on table public.notification_outbox from anon, authenticated;

grant select on table public.people to authenticated;
grant select on table public.registrations to authenticated;
grant select on table public.attendance to authenticated;
grant select on table public.notification_outbox to authenticated;
grant all on table public.registrations to service_role;
grant all on table public.attendance to service_role;
grant all on table public.notification_outbox to service_role;
grant usage, select on sequence public.activity_registration_code_seq to service_role;

create policy people_admin_read
on public.people
for select
to authenticated
using ((select public.is_active_admin()));

create policy registrations_admin_read
on public.registrations
for select
to authenticated
using ((select public.is_active_admin()));

create policy attendance_admin_read
on public.attendance
for select
to authenticated
using ((select public.is_active_admin()));

create policy notification_outbox_admin_read
on public.notification_outbox
for select
to authenticated
using ((select public.is_active_admin()));

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
  v_activity public.activities%rowtype;
  v_active_registration_count bigint;
  v_attendance_id uuid;
  v_company text := nullif(btrim(p_registration->>'company'), '');
  v_document_number text := upper(btrim(p_registration->>'document_number'));
  v_document_type text := lower(btrim(p_registration->>'document_type'));
  v_email text := lower(btrim(p_registration->>'email'));
  v_event_type text;
  v_first_names text := btrim(p_registration->>'first_names');
  v_job_title text := btrim(p_registration->>'job_title');
  v_last_names text := btrim(p_registration->>'last_names');
  v_person_id uuid;
  v_phone text := regexp_replace(btrim(p_registration->>'phone'), '[[:space:]-]', '', 'g');
  v_price numeric(10, 2);
  v_registration_code varchar(40);
  v_registration_id uuid;
  v_registration_status public.registration_status;
  v_registration_type text := lower(btrim(p_registration->>'registration_type'));
  v_ruc text := nullif(btrim(p_registration->>'ruc'), '');
  v_address text := nullif(btrim(p_registration->>'address'), '');
begin
  if p_activity_id is null or p_registration is null then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  select *
  into v_activity
  from public.activities
  where id = p_activity_id
  for update;

  if not found or v_activity.deleted_at is not null then
    raise exception 'ACTIVITY_NOT_FOUND' using errcode = 'P0001';
  end if;

  if v_activity.status <> 'published' or v_activity.published_at is null then
    raise exception 'REGISTRATION_CLOSED' using errcode = 'P0001';
  end if;

  if v_activity.registrations_closed_manually
    or (v_activity.registration_open_at is not null and now() < v_activity.registration_open_at)
    or (v_activity.registration_close_at is not null and now() > v_activity.registration_close_at)
  then
    raise exception 'REGISTRATION_CLOSED' using errcode = 'P0001';
  end if;

  if v_document_type not in ('dni', 'ce')
    or v_registration_type not in ('general', 'member')
    or v_first_names is null or length(v_first_names) < 2 or length(v_first_names) > 120
    or v_last_names is null or length(v_last_names) < 2 or length(v_last_names) > 120
    or v_email is null or length(v_email) > 320
    or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or v_phone is null or v_phone !~ '^\+?[0-9]{7,15}$'
    or v_job_title is null or length(v_job_title) < 2
  then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  if (v_document_type = 'dni' and v_document_number !~ '^[0-9]{8}$')
    or (v_document_type = 'ce' and v_document_number !~ '^[A-Z0-9]{6,20}$')
  then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  if v_ruc is not null and v_ruc !~ '^[0-9]{11}$' then
    raise exception 'INVALID_MEMBER_DATA' using errcode = '22023';
  end if;

  if v_registration_type = 'member'
    and (v_company is null or v_ruc is null)
  then
    raise exception 'INVALID_MEMBER_DATA' using errcode = '22023';
  end if;

  if v_activity.members_only and v_registration_type <> 'member' then
    raise exception 'INVALID_MEMBER_DATA' using errcode = 'P0001';
  end if;

  select count(*)
  into v_active_registration_count
  from public.registrations
  where activity_id = v_activity.id
    and status in ('pending', 'confirmed')
    and deleted_at is null;

  if v_activity.capacity is not null
    and v_active_registration_count >= v_activity.capacity
  then
    raise exception 'NO_AVAILABLE_CAPACITY' using errcode = 'P0001';
  end if;

  insert into public.people (
    document_type,
    document_number,
    first_names,
    last_names,
    email,
    phone,
    job_title,
    company,
    ruc,
    address,
    deleted_at,
    deleted_by
  ) values (
    v_document_type::public.document_type,
    v_document_number,
    v_first_names,
    v_last_names,
    v_email,
    v_phone,
    v_job_title,
    v_company,
    v_ruc,
    v_address,
    null,
    null
  )
  on conflict (document_type, document_number) do update set
    email = excluded.email,
    phone = excluded.phone,
    job_title = excluded.job_title,
    company = excluded.company,
    ruc = excluded.ruc,
    address = excluded.address,
    deleted_at = null,
    deleted_by = null
  returning id into v_person_id;

  if exists (
    select 1
    from public.registrations
    where activity_id = v_activity.id
      and person_id = v_person_id
      and deleted_at is null
  ) then
    raise exception 'DUPLICATE_REGISTRATION' using errcode = '23505';
  end if;

  v_registration_status := case
    when v_activity.is_free then 'confirmed'::public.registration_status
    else 'pending'::public.registration_status
  end;
  v_price := case
    when v_activity.is_free then 0
    when v_registration_type = 'member' then v_activity.member_price
    else v_activity.general_price
  end;
  v_event_type := case
    when v_activity.is_free then 'activity_free_registration_confirmed'
    else 'activity_paid_preregistration_created'
  end;
  v_registration_code := concat(
    'CCI-',
    case when v_activity.type = 'event' then 'EV-' else 'CA-' end,
    lpad(nextval('public.activity_registration_code_seq'::regclass)::text, 6, '0')
  );

  insert into public.registrations (
    activity_id,
    person_id,
    registration_code,
    registration_type,
    status,
    company_snapshot,
    ruc_snapshot,
    price_snapshot,
    confirmed_at
  ) values (
    v_activity.id,
    v_person_id,
    v_registration_code,
    v_registration_type::public.registration_type,
    v_registration_status,
    v_company,
    v_ruc,
    v_price,
    case when v_registration_status = 'confirmed' then now() else null end
  )
  returning id into v_registration_id;

  insert into public.attendance (registration_id)
  values (v_registration_id)
  returning id into v_attendance_id;

  insert into public.notification_outbox (
    person_id,
    event_type,
    recipient_email,
    related_entity_type,
    related_entity_id,
    payload
  ) values (
    v_person_id,
    v_event_type,
    v_email,
    'registration',
    v_registration_id,
    jsonb_build_object(
      'activity_id', v_activity.id,
      'activity_slug', v_activity.slug,
      'activity_title', v_activity.title,
      'activity_type', v_activity.type,
      'registration_code', v_registration_code,
      'registration_status', v_registration_status
    )
  );

  return jsonb_build_object(
    'activity_id', v_activity.id,
    'activity_slug', v_activity.slug,
    'activity_title', v_activity.title,
    'activity_type', v_activity.type,
    'attendance_id', v_attendance_id,
    'notification_event', v_event_type,
    'price_snapshot', v_price,
    'registration_code', v_registration_code,
    'registration_id', v_registration_id,
    'status', v_registration_status
  );
exception
  when unique_violation then
    raise exception 'DUPLICATE_REGISTRATION' using errcode = '23505';
end;
$$;

revoke execute on function public.register_activity(uuid, jsonb) from public;
grant execute on function public.register_activity(uuid, jsonb) to anon, authenticated, service_role;

create or replace function public.get_public_registration_result(p_registration_code text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'activity_slug', activities.slug,
    'activity_title', activities.title,
    'activity_type', activities.type,
    'contact_email', activities.contact_email,
    'contact_name', activities.contact_name,
    'contact_phone', activities.contact_phone,
    'is_free', activities.is_free,
    'price_snapshot', registrations.price_snapshot,
    'registration_code', registrations.registration_code,
    'status', registrations.status
  )
  from public.registrations
  join public.activities on activities.id = registrations.activity_id
  where registrations.registration_code = upper(btrim(p_registration_code))
    and registrations.deleted_at is null
    and activities.deleted_at is null;
$$;

revoke execute on function public.get_public_registration_result(text) from public;
grant execute on function public.get_public_registration_result(text) to anon, authenticated, service_role;

comment on table public.registrations is 'Inscripciones y preinscripciones a actividades con snapshots históricos.';
comment on table public.attendance is 'Asistencia general preparada desde cada inscripción.';
comment on table public.notification_outbox is 'Cola transaccional preparada para el envío de notificaciones del Hito 5.';
comment on function public.register_activity(uuid, jsonb) is 'Registra una actividad de forma transaccional y emite su evento de notificación.';
comment on function public.get_public_registration_result(text) is 'Devuelve únicamente el resultado público no sensible de una inscripción.';
