create extension if not exists pgcrypto with schema extensions;

create type public.document_type as enum ('dni', 'ce');
create type public.user_role as enum ('student', 'operator', 'administrator');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.set_updated_at() from public, anon, authenticated;
grant execute on function public.set_updated_at() to service_role;

create table public.people (
  id uuid primary key default gen_random_uuid(),
  document_type public.document_type not null default 'dni',
  document_number varchar(20) not null,
  first_names varchar(120) not null,
  last_names varchar(120) not null,
  email text not null,
  phone varchar(30) not null,
  job_title text not null,
  company text,
  ruc varchar(11),
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  constraint people_document_number_not_blank check (length(btrim(document_number)) > 0),
  constraint people_document_number_canonical check (document_number = upper(btrim(document_number))),
  constraint people_first_names_not_blank check (length(btrim(first_names)) > 0),
  constraint people_last_names_not_blank check (length(btrim(last_names)) > 0),
  constraint people_email_not_blank check (length(btrim(email)) > 0),
  constraint people_phone_not_blank check (length(btrim(phone)) > 0),
  constraint people_job_title_not_blank check (length(btrim(job_title)) > 0),
  constraint people_ruc_format check (ruc is null or ruc ~ '^[0-9]{11}$'),
  constraint people_deleted_by_consistency check (deleted_at is not null or deleted_by is null)
);

create table public.user_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete restrict,
  role public.user_role not null default 'student',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  constraint user_accounts_deleted_by_consistency check (deleted_at is not null or deleted_by is null)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null,
  slug varchar(120) not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  constraint categories_name_not_blank check (length(btrim(name)) > 0),
  constraint categories_slug_canonical check (
    slug = lower(btrim(slug))
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint categories_sort_order_nonnegative check (sort_order >= 0),
  constraint categories_deleted_by_consistency check (deleted_at is not null or deleted_by is null)
);

create table public.speakers (
  id uuid primary key default gen_random_uuid(),
  first_names varchar(120) not null,
  last_names varchar(120) not null,
  professional_title text,
  organization text,
  bio text,
  photo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  constraint speakers_first_names_not_blank check (length(btrim(first_names)) > 0),
  constraint speakers_last_names_not_blank check (length(btrim(last_names)) > 0),
  constraint speakers_deleted_by_consistency check (deleted_at is not null or deleted_by is null)
);

create unique index uq_people_document
on public.people(document_type, document_number);

create index idx_people_email_active
on public.people(lower(email))
where deleted_at is null;

create index idx_people_first_names_active
on public.people(lower(first_names))
where deleted_at is null;

create index idx_people_last_names_active
on public.people(lower(last_names))
where deleted_at is null;

create index idx_people_phone_active
on public.people(phone)
where deleted_at is null;

create unique index uq_user_accounts_person_active
on public.user_accounts(person_id)
where deleted_at is null;

create index idx_user_accounts_person_id
on public.user_accounts(person_id);

create unique index uq_categories_slug_active
on public.categories(slug)
where deleted_at is null;

create index idx_categories_public_order
on public.categories(is_active, sort_order, name)
where deleted_at is null;

create index idx_speakers_name_active
on public.speakers(lower(last_names), lower(first_names))
where deleted_at is null;

create trigger set_people_updated_at
before update on public.people
for each row execute function public.set_updated_at();

create trigger set_user_accounts_updated_at
before update on public.user_accounts
for each row execute function public.set_updated_at();

create trigger set_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger set_speakers_updated_at
before update on public.speakers
for each row execute function public.set_updated_at();

alter table public.people enable row level security;
alter table public.user_accounts enable row level security;
alter table public.categories enable row level security;
alter table public.speakers enable row level security;

revoke all on table public.people from anon, authenticated;
revoke all on table public.user_accounts from anon, authenticated;
revoke all on table public.categories from anon, authenticated;
revoke all on table public.speakers from anon, authenticated;

grant select on table public.categories to anon, authenticated;
grant select on table public.speakers to anon, authenticated;
grant all on table public.people to service_role;
grant all on table public.user_accounts to service_role;
grant all on table public.categories to service_role;
grant all on table public.speakers to service_role;

create policy categories_public_read
on public.categories
for select
to anon, authenticated
using (is_active and deleted_at is null);

create policy speakers_public_read
on public.speakers
for select
to anon, authenticated
using (deleted_at is null);

comment on table public.people is 'Identidad institucional única de participantes y usuarios.';
comment on table public.user_accounts is 'Vinculación entre Supabase Auth y la identidad institucional.';
comment on table public.categories is 'Catálogo temático reutilizable por actividades.';
comment on table public.speakers is 'Registro reutilizable de expositores, docentes e instructores.';
