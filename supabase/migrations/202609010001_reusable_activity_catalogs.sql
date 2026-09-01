create table public.venues (
  id uuid primary key default gen_random_uuid(),
  name varchar(160) not null,
  address text not null,
  reference text,
  maps_embed_url text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  constraint venues_name_not_blank check (length(btrim(name)) > 0),
  constraint venues_address_not_blank check (length(btrim(address)) > 0),
  constraint venues_maps_embed_url_valid check (
    maps_embed_url ~ '^https://(www\.)?google\.com/maps/embed\?'
    or maps_embed_url ~ '^https://maps\.google\.com/maps\?'
  ),
  constraint venues_deleted_by_consistency check (deleted_at is not null or deleted_by is null)
);

create unique index uq_venues_name_address_active
on public.venues(lower(name), lower(address))
where deleted_at is null;

create index idx_venues_active_name
on public.venues(is_active, lower(name))
where deleted_at is null;

create trigger set_venues_updated_at
before update on public.venues
for each row execute function public.set_updated_at();

create table public.activity_contacts (
  id uuid primary key default gen_random_uuid(),
  label varchar(120) not null,
  contact_name text not null,
  whatsapp_phone varchar(30) not null,
  email text,
  is_default boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  constraint activity_contacts_label_not_blank check (length(btrim(label)) > 0),
  constraint activity_contacts_name_not_blank check (length(btrim(contact_name)) > 0),
  constraint activity_contacts_whatsapp_valid check (
    regexp_replace(whatsapp_phone, '[^0-9]', '', 'g') ~ '^9[0-9]{8}$'
    or regexp_replace(whatsapp_phone, '[^0-9]', '', 'g') ~ '^[1-9][0-9]{10,14}$'
  ),
  constraint activity_contacts_email_valid check (
    email is null or email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  constraint activity_contacts_deleted_by_consistency check (deleted_at is not null or deleted_by is null)
);

create unique index uq_activity_contacts_label_active
on public.activity_contacts(lower(label))
where deleted_at is null;

create unique index uq_activity_contacts_default_active
on public.activity_contacts(is_default)
where is_default and deleted_at is null;

create index idx_activity_contacts_active_label
on public.activity_contacts(is_active, lower(label))
where deleted_at is null;

create trigger set_activity_contacts_updated_at
before update on public.activity_contacts
for each row execute function public.set_updated_at();

alter table public.speakers
add column linkedin_url text,
add column website_url text,
add column specialties text[] not null default '{}'::text[],
add column is_active boolean not null default true;

alter table public.speakers
add constraint speakers_linkedin_url_valid check (linkedin_url is null or linkedin_url ~ '^https://'),
add constraint speakers_website_url_valid check (website_url is null or website_url ~ '^https://'),
add constraint speakers_specialties_limit check (cardinality(specialties) <= 12);

create table public.speaker_private_details (
  speaker_id uuid primary key references public.speakers(id) on delete cascade,
  email text,
  phone varchar(30),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint speaker_private_email_valid check (
    email is null or email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  )
);

create trigger set_speaker_private_details_updated_at
before update on public.speaker_private_details
for each row execute function public.set_updated_at();

alter table public.activities
add column venue_id uuid references public.venues(id) on delete restrict,
add column contact_id uuid references public.activity_contacts(id) on delete restrict;

insert into public.venues (name, address, maps_embed_url)
select distinct on (lower(btrim(location_name)), lower(btrim(address)))
  btrim(location_name),
  btrim(address),
  btrim(maps_embed_url)
from public.activities
where deleted_at is null
  and modality <> 'virtual'
  and nullif(btrim(location_name), '') is not null
  and nullif(btrim(address), '') is not null
  and nullif(btrim(maps_embed_url), '') is not null
order by lower(btrim(location_name)), lower(btrim(address)), created_at;

update public.activities activity
set venue_id = venue.id
from public.venues venue
where activity.venue_id is null
  and activity.deleted_at is null
  and lower(btrim(activity.location_name)) = lower(venue.name)
  and lower(btrim(activity.address)) = lower(venue.address)
  and venue.deleted_at is null;

insert into public.activity_contacts (
  label, contact_name, whatsapp_phone, email, is_default
)
select
  coalesce(nullif(btrim(contact_name), ''), 'Contacto CCI'),
  coalesce(nullif(btrim(contact_name), ''), 'Cámara de Comercio de Ica'),
  btrim(contact_phone),
  nullif(btrim(contact_email), ''),
  false
from public.activities
where deleted_at is null
  and nullif(btrim(contact_phone), '') is not null
group by contact_name, contact_phone, contact_email
on conflict do nothing;

update public.activity_contacts
set is_default = true
where id = (
  select id from public.activity_contacts
  where deleted_at is null
  order by created_at, id
  limit 1
);

update public.activities activity
set contact_id = contact.id
from public.activity_contacts contact
where activity.contact_id is null
  and activity.deleted_at is null
  and regexp_replace(activity.contact_phone, '[^0-9]', '', 'g') =
      regexp_replace(contact.whatsapp_phone, '[^0-9]', '', 'g')
  and contact.deleted_at is null;

alter table public.activities
drop constraint if exists activities_published_map_required,
drop constraint if exists activities_published_whatsapp_required;

create or replace function public.validate_activity_catalogs()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published' and new.modality <> 'virtual' then
    if new.venue_id is null or not exists (
      select 1 from public.venues venue
      where venue.id = new.venue_id
        and venue.is_active
        and venue.deleted_at is null
    ) then
      raise exception 'Selecciona un lugar activo antes de publicar.'
        using errcode = '23514', constraint = 'activities_published_venue_required';
    end if;
  end if;

  if new.status = 'published' then
    if new.contact_id is null or not exists (
      select 1 from public.activity_contacts contact
      where contact.id = new.contact_id
        and contact.is_active
        and contact.deleted_at is null
    ) then
      raise exception 'Selecciona un contacto activo antes de publicar.'
        using errcode = '23514', constraint = 'activities_published_contact_required';
    end if;
  end if;

  return new;
end;
$$;

create trigger validate_activity_catalogs_before_write
before insert or update of status, modality, venue_id, contact_id
on public.activities
for each row execute function public.validate_activity_catalogs();

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
      id, category_id, venue_id, contact_id, type, title, slug,
      short_description, description, objective, target_audience, modality,
      virtual_url, duration_text, academic_hours, program, syllabus, banner_path,
      is_free, general_price, member_price, members_only, capacity,
      registration_open_at, registration_close_at,
      registrations_closed_manually, additional_info, status, published_at,
      created_by, updated_by
    ) values (
      v_activity_id,
      nullif(p_activity->>'category_id', '')::uuid,
      nullif(p_activity->>'venue_id', '')::uuid,
      nullif(p_activity->>'contact_id', '')::uuid,
      (p_activity->>'type')::public.activity_type,
      btrim(p_activity->>'title'),
      btrim(p_activity->>'slug'),
      nullif(btrim(p_activity->>'short_description'), ''),
      btrim(p_activity->>'description'),
      nullif(btrim(p_activity->>'objective'), ''),
      nullif(btrim(p_activity->>'target_audience'), ''),
      (p_activity->>'modality')::public.activity_modality,
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
      venue_id = nullif(p_activity->>'venue_id', '')::uuid,
      contact_id = nullif(p_activity->>'contact_id', '')::uuid,
      type = (p_activity->>'type')::public.activity_type,
      title = btrim(p_activity->>'title'),
      slug = btrim(p_activity->>'slug'),
      short_description = nullif(btrim(p_activity->>'short_description'), ''),
      description = btrim(p_activity->>'description'),
      objective = nullif(btrim(p_activity->>'objective'), ''),
      target_audience = nullif(btrim(p_activity->>'target_audience'), ''),
      modality = (p_activity->>'modality')::public.activity_modality,
      virtual_url = nullif(btrim(p_activity->>'virtual_url'), ''),
      duration_text = nullif(btrim(p_activity->>'duration_text'), ''),
      academic_hours = nullif(p_activity->>'academic_hours', '')::numeric,
      program = nullif(btrim(p_activity->>'program'), ''),
      syllabus = nullif(btrim(p_activity->>'syllabus'), ''),
      banner_path = coalesce(nullif(btrim(p_activity->>'banner_path'), ''), activities.banner_path),
      is_free = coalesce((p_activity->>'is_free')::boolean, false),
      general_price = coalesce(nullif(p_activity->>'general_price', '')::numeric, 0),
      member_price = coalesce(nullif(p_activity->>'member_price', '')::numeric, 0),
      members_only = coalesce((p_activity->>'members_only')::boolean, false),
      capacity = nullif(p_activity->>'capacity', '')::integer,
      registration_open_at = nullif(p_activity->>'registration_open_at', '')::timestamptz,
      registration_close_at = nullif(p_activity->>'registration_close_at', '')::timestamptz,
      registrations_closed_manually = coalesce((p_activity->>'registrations_closed_manually')::boolean, false),
      additional_info = nullif(btrim(p_activity->>'additional_info'), ''),
      status = v_status,
      published_at = case when v_status = 'published' then coalesce(activities.published_at, now()) else activities.published_at end,
      updated_by = (select auth.uid())
    where id = v_activity_id and deleted_at is null;

    if not found then
      raise exception 'La actividad no existe o fue eliminada.' using errcode = 'P0002';
    end if;

    update public.activity_dates set deleted_at = now(), deleted_by = (select auth.uid())
    where activity_id = v_activity_id and deleted_at is null;
    update public.activity_speakers set deleted_at = now(), deleted_by = (select auth.uid())
    where activity_id = v_activity_id and deleted_at is null;
  end if;

  for v_date in select value from jsonb_array_elements(p_dates)
  loop
    insert into public.activity_dates (activity_id, starts_at, ends_at, label, sort_order)
    values (
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
      insert into public.activity_speakers (activity_id, speaker_id, role_label, sort_order)
      values (
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

alter table public.venues enable row level security;
alter table public.activity_contacts enable row level security;
alter table public.speaker_private_details enable row level security;

create policy venues_public_read on public.venues
for select to anon, authenticated
using (
  deleted_at is null and (
    (is_active and exists (
      select 1 from public.activities activity
      where activity.venue_id = venues.id
        and activity.deleted_at is null
        and activity.published_at is not null
        and activity.status in ('published', 'finished', 'cancelled')
    ))
    or (select public.is_internal_user())
  )
);

create policy venues_internal_all on public.venues
for all to authenticated
using ((select public.is_internal_user()))
with check ((select public.is_internal_user()));

create policy activity_contacts_public_read on public.activity_contacts
for select to anon, authenticated
using (
  deleted_at is null and exists (
    select 1 from public.activities activity
    where activity.contact_id = activity_contacts.id
      and activity.deleted_at is null
      and activity.published_at is not null
      and activity.status in ('published', 'finished', 'cancelled')
  )
);

create policy activity_contacts_internal_all on public.activity_contacts
for all to authenticated
using ((select public.is_internal_user()))
with check ((select public.is_internal_user()));

create policy speaker_private_details_internal_all on public.speaker_private_details
for all to authenticated
using ((select public.is_internal_user()))
with check ((select public.is_internal_user()));

grant select on table public.venues, public.activity_contacts to anon, authenticated;
grant insert, update, delete on table public.venues, public.activity_contacts to authenticated;
grant select, insert, update, delete on table public.speaker_private_details to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'speaker-images', 'speaker-images', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy speaker_images_public_read on storage.objects
for select to anon, authenticated
using (bucket_id = 'speaker-images');

create policy speaker_images_internal_insert on storage.objects
for insert to authenticated
with check (bucket_id = 'speaker-images' and (select public.is_internal_user()));

create policy speaker_images_internal_update on storage.objects
for update to authenticated
using (bucket_id = 'speaker-images' and (select public.is_internal_user()))
with check (bucket_id = 'speaker-images' and (select public.is_internal_user()));

create policy speaker_images_internal_delete on storage.objects
for delete to authenticated
using (bucket_id = 'speaker-images' and (select public.is_internal_user()));

comment on table public.venues is 'Lugares físicos reutilizables por eventos y capacitaciones.';
comment on table public.activity_contacts is 'Contactos públicos reutilizables para atención e inscripciones.';
comment on table public.speaker_private_details is 'Información interna no publicable de ponentes e instructores.';
comment on column public.activities.venue_id is 'Lugar normalizado mostrado en vivo en el detalle público.';
comment on column public.activities.contact_id is 'Contacto normalizado mostrado en vivo en el detalle público.';
comment on column public.activities.location_name is 'Campo legado; venue_id es la fuente oficial.';
comment on column public.activities.address is 'Campo legado; venue_id es la fuente oficial.';
comment on column public.activities.maps_embed_url is 'Campo legado; venue_id es la fuente oficial.';
comment on column public.activities.contact_name is 'Campo legado; contact_id es la fuente oficial.';
comment on column public.activities.contact_phone is 'Campo legado; contact_id es la fuente oficial.';
comment on column public.activities.contact_email is 'Campo legado; contact_id es la fuente oficial.';
