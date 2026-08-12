create type public.activity_type as enum ('event', 'training');
create type public.activity_modality as enum ('in_person', 'virtual', 'hybrid');
create type public.activity_status as enum (
  'draft',
  'published',
  'finished',
  'archived',
  'cancelled'
);

create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_accounts
    where user_id = (select auth.uid())
      and role in ('operator', 'administrator')
      and is_active
      and deleted_at is null
  );
$$;

revoke execute on function public.is_active_admin() from public, anon;
grant execute on function public.is_active_admin() to authenticated, service_role;

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete restrict,
  type public.activity_type not null,
  title varchar(200) not null,
  slug varchar(220) not null,
  short_description text,
  description text not null,
  objective text,
  target_audience text,
  modality public.activity_modality not null,
  location_name text,
  address text,
  virtual_url text,
  duration_text varchar(100),
  academic_hours numeric(6, 2),
  program text,
  syllabus text,
  banner_path text,
  is_free boolean not null default false,
  general_price numeric(10, 2) not null default 0,
  member_price numeric(10, 2) not null default 0,
  members_only boolean not null default false,
  capacity integer,
  registration_open_at timestamptz,
  registration_close_at timestamptz,
  registrations_closed_manually boolean not null default false,
  contact_name text,
  contact_phone varchar(30),
  contact_email text,
  additional_info text,
  status public.activity_status not null default 'draft',
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  constraint activities_title_not_blank check (length(btrim(title)) > 0),
  constraint activities_slug_canonical check (
    slug = lower(btrim(slug))
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint activities_description_not_blank check (length(btrim(description)) > 0),
  constraint activities_general_price_nonnegative check (general_price >= 0),
  constraint activities_member_price_nonnegative check (member_price >= 0),
  constraint activities_capacity_positive check (capacity is null or capacity > 0),
  constraint activities_academic_hours_nonnegative check (
    academic_hours is null or academic_hours >= 0
  ),
  constraint activities_free_prices_zero check (
    not is_free or (general_price = 0 and member_price = 0)
  ),
  constraint activities_registration_period_valid check (
    registration_open_at is null
    or registration_close_at is null
    or registration_close_at > registration_open_at
  ),
  constraint activities_deleted_by_consistency check (
    deleted_at is not null or deleted_by is null
  )
);

create table public.activity_dates (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz,
  label text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  constraint activity_dates_period_valid check (ends_at is null or ends_at > starts_at),
  constraint activity_dates_sort_order_nonnegative check (sort_order >= 0),
  constraint activity_dates_deleted_by_consistency check (
    deleted_at is not null or deleted_by is null
  )
);

create table public.activity_speakers (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  speaker_id uuid not null references public.speakers(id) on delete restrict,
  role_label text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  constraint activity_speakers_sort_order_nonnegative check (sort_order >= 0),
  constraint activity_speakers_deleted_by_consistency check (
    deleted_at is not null or deleted_by is null
  )
);

create unique index uq_activities_slug_active
on public.activities(slug)
where deleted_at is null;

create index idx_activities_type on public.activities(type) where deleted_at is null;
create index idx_activities_category_id on public.activities(category_id) where deleted_at is null;
create index idx_activities_status on public.activities(status) where deleted_at is null;
create index idx_activities_modality on public.activities(modality) where deleted_at is null;
create index idx_activities_published_at on public.activities(published_at desc) where deleted_at is null;
create index idx_activities_registration_open_at on public.activities(registration_open_at) where deleted_at is null;
create index idx_activities_registration_close_at on public.activities(registration_close_at) where deleted_at is null;
create index idx_activity_dates_activity_start
on public.activity_dates(activity_id, starts_at)
where deleted_at is null;
create index idx_activity_dates_starts_at
on public.activity_dates(starts_at)
where deleted_at is null;
create index idx_activity_speakers_activity_id
on public.activity_speakers(activity_id)
where deleted_at is null;
create index idx_activity_speakers_speaker_id
on public.activity_speakers(speaker_id)
where deleted_at is null;
create unique index uq_activity_speaker_active
on public.activity_speakers(activity_id, speaker_id)
where deleted_at is null;

create trigger set_activities_updated_at
before update on public.activities
for each row execute function public.set_updated_at();

create trigger set_activity_dates_updated_at
before update on public.activity_dates
for each row execute function public.set_updated_at();

create trigger set_activity_speakers_updated_at
before update on public.activity_speakers
for each row execute function public.set_updated_at();

alter table public.activities enable row level security;
alter table public.activity_dates enable row level security;
alter table public.activity_speakers enable row level security;

revoke all on table public.activities from anon, authenticated;
revoke all on table public.activity_dates from anon, authenticated;
revoke all on table public.activity_speakers from anon, authenticated;

grant select on table public.activities, public.activity_dates, public.activity_speakers to anon;
grant select, insert, update on table public.activities, public.activity_dates, public.activity_speakers to authenticated;
grant all on table public.activities, public.activity_dates, public.activity_speakers to service_role;

create policy activities_public_read
on public.activities
for select
to anon, authenticated
using (
  deleted_at is null
  and published_at is not null
  and status in ('published', 'finished', 'cancelled')
);

create policy activities_admin_all
on public.activities
for all
to authenticated
using ((select public.is_active_admin()))
with check ((select public.is_active_admin()));

create policy activity_dates_public_read
on public.activity_dates
for select
to anon, authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.activities
    where activities.id = activity_dates.activity_id
      and activities.deleted_at is null
      and activities.published_at is not null
      and activities.status in ('published', 'finished', 'cancelled')
  )
);

create policy activity_dates_admin_all
on public.activity_dates
for all
to authenticated
using ((select public.is_active_admin()))
with check ((select public.is_active_admin()));

create policy activity_speakers_public_read
on public.activity_speakers
for select
to anon, authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.activities
    where activities.id = activity_speakers.activity_id
      and activities.deleted_at is null
      and activities.published_at is not null
      and activities.status in ('published', 'finished', 'cancelled')
  )
);

create policy activity_speakers_admin_all
on public.activity_speakers
for all
to authenticated
using ((select public.is_active_admin()))
with check ((select public.is_active_admin()));

create or replace function public.save_activity(
  p_activity jsonb,
  p_dates jsonb,
  p_speakers jsonb
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_activity_id uuid := nullif(p_activity->>'id', '')::uuid;
  v_date jsonb;
  v_speaker jsonb;
  v_status public.activity_status := coalesce(
    nullif(p_activity->>'status', '')::public.activity_status,
    'draft'
  );
begin
  if not public.is_active_admin() then
    raise exception 'No autorizado para gestionar actividades.' using errcode = '42501';
  end if;

  if jsonb_typeof(p_dates) <> 'array' or jsonb_array_length(p_dates) = 0 then
    raise exception 'La actividad requiere al menos una fecha.' using errcode = '22023';
  end if;

  if v_activity_id is null then
    v_activity_id := extensions.gen_random_uuid();

    insert into public.activities (
      id, category_id, type, title, slug, short_description, description,
      objective, target_audience, modality, location_name, address, virtual_url,
      duration_text, academic_hours, program, syllabus, banner_path, is_free,
      general_price, member_price, members_only, capacity, registration_open_at,
      registration_close_at, registrations_closed_manually, contact_name,
      contact_phone, contact_email, additional_info, status, published_at,
      created_by, updated_by
    ) values (
      v_activity_id,
      nullif(p_activity->>'category_id', '')::uuid,
      (p_activity->>'type')::public.activity_type,
      btrim(p_activity->>'title'),
      btrim(p_activity->>'slug'),
      nullif(btrim(p_activity->>'short_description'), ''),
      btrim(p_activity->>'description'),
      nullif(btrim(p_activity->>'objective'), ''),
      nullif(btrim(p_activity->>'target_audience'), ''),
      (p_activity->>'modality')::public.activity_modality,
      nullif(btrim(p_activity->>'location_name'), ''),
      nullif(btrim(p_activity->>'address'), ''),
      nullif(btrim(p_activity->>'virtual_url'), ''),
      nullif(btrim(p_activity->>'duration_text'), ''),
      nullif(p_activity->>'academic_hours', '')::numeric,
      nullif(btrim(p_activity->>'program'), ''),
      nullif(btrim(p_activity->>'syllabus'), ''),
      nullif(btrim(p_activity->>'banner_path'), ''),
      coalesce((p_activity->>'is_free')::boolean, false),
      coalesce(nullif(p_activity->>'general_price', '')::numeric, 0),
      coalesce(nullif(p_activity->>'member_price', '')::numeric, 0),
      coalesce((p_activity->>'members_only')::boolean, false),
      nullif(p_activity->>'capacity', '')::integer,
      nullif(p_activity->>'registration_open_at', '')::timestamptz,
      nullif(p_activity->>'registration_close_at', '')::timestamptz,
      coalesce((p_activity->>'registrations_closed_manually')::boolean, false),
      nullif(btrim(p_activity->>'contact_name'), ''),
      nullif(btrim(p_activity->>'contact_phone'), ''),
      nullif(btrim(p_activity->>'contact_email'), ''),
      nullif(btrim(p_activity->>'additional_info'), ''),
      v_status,
      case when v_status = 'published' then now() else null end,
      (select auth.uid()),
      (select auth.uid())
    );
  else
    update public.activities
    set
      category_id = nullif(p_activity->>'category_id', '')::uuid,
      type = (p_activity->>'type')::public.activity_type,
      title = btrim(p_activity->>'title'),
      slug = btrim(p_activity->>'slug'),
      short_description = nullif(btrim(p_activity->>'short_description'), ''),
      description = btrim(p_activity->>'description'),
      objective = nullif(btrim(p_activity->>'objective'), ''),
      target_audience = nullif(btrim(p_activity->>'target_audience'), ''),
      modality = (p_activity->>'modality')::public.activity_modality,
      location_name = nullif(btrim(p_activity->>'location_name'), ''),
      address = nullif(btrim(p_activity->>'address'), ''),
      virtual_url = nullif(btrim(p_activity->>'virtual_url'), ''),
      duration_text = nullif(btrim(p_activity->>'duration_text'), ''),
      academic_hours = nullif(p_activity->>'academic_hours', '')::numeric,
      program = nullif(btrim(p_activity->>'program'), ''),
      syllabus = nullif(btrim(p_activity->>'syllabus'), ''),
      banner_path = coalesce(
        nullif(btrim(p_activity->>'banner_path'), ''),
        activities.banner_path
      ),
      is_free = coalesce((p_activity->>'is_free')::boolean, false),
      general_price = coalesce(nullif(p_activity->>'general_price', '')::numeric, 0),
      member_price = coalesce(nullif(p_activity->>'member_price', '')::numeric, 0),
      members_only = coalesce((p_activity->>'members_only')::boolean, false),
      capacity = nullif(p_activity->>'capacity', '')::integer,
      registration_open_at = nullif(p_activity->>'registration_open_at', '')::timestamptz,
      registration_close_at = nullif(p_activity->>'registration_close_at', '')::timestamptz,
      registrations_closed_manually = coalesce(
        (p_activity->>'registrations_closed_manually')::boolean,
        false
      ),
      contact_name = nullif(btrim(p_activity->>'contact_name'), ''),
      contact_phone = nullif(btrim(p_activity->>'contact_phone'), ''),
      contact_email = nullif(btrim(p_activity->>'contact_email'), ''),
      additional_info = nullif(btrim(p_activity->>'additional_info'), ''),
      status = v_status,
      published_at = case
        when v_status = 'published' then coalesce(activities.published_at, now())
        else activities.published_at
      end,
      updated_by = (select auth.uid())
    where id = v_activity_id and deleted_at is null;

    if not found then
      raise exception 'La actividad no existe o fue eliminada.' using errcode = 'P0002';
    end if;

    update public.activity_dates
    set deleted_at = now(), deleted_by = (select auth.uid())
    where activity_id = v_activity_id and deleted_at is null;

    update public.activity_speakers
    set deleted_at = now(), deleted_by = (select auth.uid())
    where activity_id = v_activity_id and deleted_at is null;
  end if;

  for v_date in select value from jsonb_array_elements(p_dates)
  loop
    insert into public.activity_dates (
      activity_id, starts_at, ends_at, label, sort_order
    ) values (
      v_activity_id,
      (v_date->>'starts_at')::timestamptz,
      nullif(v_date->>'ends_at', '')::timestamptz,
      nullif(btrim(v_date->>'label'), ''),
      coalesce((v_date->>'sort_order')::integer, 0)
    );
  end loop;

  if jsonb_typeof(p_speakers) = 'array' then
    for v_speaker in select value from jsonb_array_elements(p_speakers)
    loop
      insert into public.activity_speakers (
        activity_id, speaker_id, role_label, sort_order
      ) values (
        v_activity_id,
        (v_speaker->>'speaker_id')::uuid,
        nullif(btrim(v_speaker->>'role_label'), ''),
        coalesce((v_speaker->>'sort_order')::integer, 0)
      );
    end loop;
  end if;

  return v_activity_id;
end;
$$;

create or replace function public.set_activity_status(
  p_activity_id uuid,
  p_status public.activity_status
)
returns uuid
language plpgsql
set search_path = ''
as $$
begin
  if not public.is_active_admin() then
    raise exception 'No autorizado para cambiar el estado.' using errcode = '42501';
  end if;

  update public.activities
  set
    status = p_status,
    published_at = case
      when p_status = 'published' then coalesce(published_at, now())
      else published_at
    end,
    updated_by = (select auth.uid())
  where id = p_activity_id and deleted_at is null;

  if not found then
    raise exception 'La actividad no existe o fue eliminada.' using errcode = 'P0002';
  end if;

  return p_activity_id;
end;
$$;

create or replace function public.soft_delete_activity(p_activity_id uuid)
returns uuid
language plpgsql
set search_path = ''
as $$
begin
  if not public.is_active_admin() then
    raise exception 'No autorizado para eliminar actividades.' using errcode = '42501';
  end if;

  update public.activities
  set deleted_at = now(), deleted_by = (select auth.uid()), updated_by = (select auth.uid())
  where id = p_activity_id and deleted_at is null;

  if not found then
    raise exception 'La actividad no existe o ya fue eliminada.' using errcode = 'P0002';
  end if;

  update public.activity_dates
  set deleted_at = now(), deleted_by = (select auth.uid())
  where activity_id = p_activity_id and deleted_at is null;

  update public.activity_speakers
  set deleted_at = now(), deleted_by = (select auth.uid())
  where activity_id = p_activity_id and deleted_at is null;

  return p_activity_id;
end;
$$;

revoke execute on function public.save_activity(jsonb, jsonb, jsonb) from public, anon;
revoke execute on function public.set_activity_status(uuid, public.activity_status) from public, anon;
revoke execute on function public.soft_delete_activity(uuid) from public, anon;
grant execute on function public.save_activity(jsonb, jsonb, jsonb) to authenticated, service_role;
grant execute on function public.set_activity_status(uuid, public.activity_status) to authenticated, service_role;
grant execute on function public.soft_delete_activity(uuid) to authenticated, service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'activity-images',
  'activity-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy activity_images_public_read
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'activity-images');

create policy activity_images_admin_insert
on storage.objects
for insert
to authenticated
with check (bucket_id = 'activity-images' and (select public.is_active_admin()));

create policy activity_images_admin_update
on storage.objects
for update
to authenticated
using (bucket_id = 'activity-images' and (select public.is_active_admin()))
with check (bucket_id = 'activity-images' and (select public.is_active_admin()));

create policy activity_images_admin_delete
on storage.objects
for delete
to authenticated
using (bucket_id = 'activity-images' and (select public.is_active_admin()));

comment on table public.activities is 'Modelo unificado de eventos y capacitaciones.';
comment on table public.activity_dates is 'Fechas y horarios de una actividad.';
comment on table public.activity_speakers is 'Asignación reutilizable de expositores a actividades.';
