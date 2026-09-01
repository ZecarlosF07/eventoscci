create or replace function public.sync_activity_catalog_compatibility()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.venue_id is not null then
    select venue.name, venue.address, venue.maps_embed_url
    into new.location_name, new.address, new.maps_embed_url
    from public.venues venue
    where venue.id = new.venue_id;
  end if;

  if new.contact_id is not null then
    select contact.contact_name, contact.whatsapp_phone, contact.email
    into new.contact_name, new.contact_phone, new.contact_email
    from public.activity_contacts contact
    where contact.id = new.contact_id;
  end if;

  return new;
end;
$$;

create or replace function public.validate_activity_catalogs()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published' and new.modality <> 'virtual' then
    if not (
      (new.venue_id is not null and exists (
        select 1 from public.venues venue
        where venue.id = new.venue_id
          and venue.is_active
          and venue.deleted_at is null
      ))
      or (
        new.venue_id is null
        and new.maps_embed_url is not null
        and (
          new.maps_embed_url ~ '^https://(www\.)?google\.com/maps/embed\?'
          or new.maps_embed_url ~ '^https://maps\.google\.com/maps\?'
        )
      )
    ) then
      raise exception 'Selecciona un lugar activo antes de publicar.'
        using errcode = '23514', constraint = 'activities_published_venue_required';
    end if;
  end if;

  if new.status = 'published' then
    if not (
      (new.contact_id is not null and exists (
        select 1 from public.activity_contacts contact
        where contact.id = new.contact_id
          and contact.is_active
          and contact.deleted_at is null
      ))
      or (
        new.contact_id is null and (
          regexp_replace(coalesce(new.contact_phone, ''), '[^0-9]', '', 'g') ~ '^9[0-9]{8}$'
          or regexp_replace(coalesce(new.contact_phone, ''), '[^0-9]', '', 'g') ~ '^[1-9][0-9]{10,14}$'
        )
      )
    ) then
      raise exception 'Selecciona un contacto activo antes de publicar.'
        using errcode = '23514', constraint = 'activities_published_contact_required';
    end if;
  end if;

  return new;
end;
$$;
