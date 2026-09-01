drop policy if exists venues_public_read on public.venues;
create policy venues_public_read on public.venues
for select to anon, authenticated
using (
  deleted_at is null and (
    exists (
      select 1 from public.activities activity
      where activity.venue_id = venues.id
        and activity.deleted_at is null
        and activity.published_at is not null
        and activity.status in ('published', 'finished', 'cancelled')
    )
    or (select public.is_internal_user())
  )
);

drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories
for select to anon, authenticated
using (
  deleted_at is null and (
    is_active
    or exists (
      select 1 from public.activities activity
      where activity.category_id = categories.id
        and activity.deleted_at is null
        and activity.published_at is not null
        and activity.status in ('published', 'finished', 'cancelled')
    )
  )
);

create or replace function public.sync_activity_catalog_compatibility()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.venue_id is null then
    new.location_name := null;
    new.address := null;
    new.maps_embed_url := null;
  else
    select venue.name, venue.address, venue.maps_embed_url
    into new.location_name, new.address, new.maps_embed_url
    from public.venues venue
    where venue.id = new.venue_id;
  end if;

  if new.contact_id is null then
    new.contact_name := null;
    new.contact_phone := null;
    new.contact_email := null;
  else
    select contact.contact_name, contact.whatsapp_phone, contact.email
    into new.contact_name, new.contact_phone, new.contact_email
    from public.activity_contacts contact
    where contact.id = new.contact_id;
  end if;

  return new;
end;
$$;

create trigger sync_activity_catalog_compatibility_before_write
before insert or update of venue_id, contact_id
on public.activities
for each row execute function public.sync_activity_catalog_compatibility();

create or replace function public.propagate_venue_compatibility()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  update public.activities
  set location_name = new.name,
      address = new.address,
      maps_embed_url = new.maps_embed_url
  where venue_id = new.id and deleted_at is null;
  return new;
end;
$$;

create trigger propagate_venue_compatibility_after_update
after update of name, address, maps_embed_url
on public.venues
for each row execute function public.propagate_venue_compatibility();

create or replace function public.propagate_contact_compatibility()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  update public.activities
  set contact_name = new.contact_name,
      contact_phone = new.whatsapp_phone,
      contact_email = new.email
  where contact_id = new.id and deleted_at is null;
  return new;
end;
$$;

create trigger propagate_contact_compatibility_after_update
after update of contact_name, whatsapp_phone, email
on public.activity_contacts
for each row execute function public.propagate_contact_compatibility();
