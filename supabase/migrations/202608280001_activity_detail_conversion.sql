alter table public.activities
add column maps_embed_url text;

alter table public.activities
add constraint activities_maps_embed_url_valid check (
  maps_embed_url is null
  or maps_embed_url ~ '^https://(www\.)?google\.com/maps/embed\?'
  or maps_embed_url ~ '^https://maps\.google\.com/maps\?'
) not valid;

alter table public.activities
add constraint activities_published_map_required check (
  status <> 'published'
  or modality = 'virtual'
  or maps_embed_url is not null
) not valid;

alter table public.activities
add constraint activities_published_whatsapp_required check (
  status <> 'published'
  or regexp_replace(coalesce(contact_phone, ''), '[^0-9]', '', 'g') ~ '^9[0-9]{8}$'
  or regexp_replace(coalesce(contact_phone, ''), '[^0-9]', '', 'g') ~ '^[1-9][0-9]{10,14}$'
) not valid;

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
      objective, target_audience, modality, location_name, address,
      maps_embed_url, virtual_url, duration_text, academic_hours, program,
      syllabus, banner_path, is_free, general_price, member_price, members_only,
      capacity, registration_open_at, registration_close_at,
      registrations_closed_manually, contact_name, contact_phone, contact_email,
      additional_info, status, published_at, created_by, updated_by
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
      nullif(btrim(p_activity->>'maps_embed_url'), ''),
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
      maps_embed_url = nullif(btrim(p_activity->>'maps_embed_url'), ''),
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

comment on column public.activities.maps_embed_url is
  'URL HTTPS de inserción de Google Maps para actividades presenciales o híbridas.';
