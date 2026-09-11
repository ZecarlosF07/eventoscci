-- Protect virtual activity links and schedule one reminder per confirmed registration/session.

create table public.activity_virtual_access (
  activity_id uuid primary key references public.activities(id) on delete cascade,
  virtual_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  constraint activity_virtual_access_url_valid check (
    virtual_url ~* '^https://[^[:space:]]+$'
  )
);

create trigger set_activity_virtual_access_updated_at
before update on public.activity_virtual_access
for each row execute function public.set_updated_at();

alter table public.activity_virtual_access enable row level security;
revoke all on table public.activity_virtual_access from public, anon, authenticated;
grant select on table public.activity_virtual_access to authenticated;
grant all on table public.activity_virtual_access to service_role;

create policy activity_virtual_access_internal_read
on public.activity_virtual_access
for select to authenticated
using ((select public.is_internal_user()));

insert into public.activity_virtual_access (activity_id, virtual_url, updated_by)
select id, btrim(virtual_url), updated_by
from public.activities
where nullif(btrim(virtual_url), '') is not null
on conflict (activity_id) do update set
  virtual_url = excluded.virtual_url,
  updated_by = excluded.updated_by;

-- The legacy column remains temporarily for a compatible rollout, but it no longer stores secrets.
update public.activities set virtual_url = null where virtual_url is not null;
comment on column public.activities.virtual_url is
  'Deprecated compatibility column. Virtual access is stored in activity_virtual_access and this column must remain null.';

create or replace function public.clear_legacy_activity_virtual_url()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.virtual_url := null;
  return new;
end;
$$;

create trigger clear_legacy_activity_virtual_url_before_write
before insert or update of virtual_url on public.activities
for each row execute function public.clear_legacy_activity_virtual_url();

create or replace function public.validate_published_activity_virtual_access()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_activity public.activities%rowtype;
  v_activity_id uuid;
begin
  if tg_table_name = 'activities' then
    v_activity_id := new.id;
  else
    v_activity_id := old.activity_id;
  end if;

  select * into v_activity
  from public.activities
  where id = v_activity_id;

  if not found or v_activity.deleted_at is not null then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;

  if v_activity.status = 'published'
    and v_activity.modality in ('virtual', 'hybrid')
    and not exists (
      select 1 from public.activity_virtual_access access
      where access.activity_id = v_activity.id
    )
  then
    raise exception 'Indica el enlace virtual antes de publicar.'
      using errcode = '23514', constraint = 'activities_published_virtual_access_required';
  end if;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

create constraint trigger validate_activity_virtual_access_after_activity_write
after insert or update on public.activities
deferrable initially deferred
for each row execute function public.validate_published_activity_virtual_access();

create constraint trigger validate_activity_virtual_access_after_access_delete
after delete on public.activity_virtual_access
deferrable initially deferred
for each row execute function public.validate_published_activity_virtual_access();

create table public.activity_virtual_reminders (
  id uuid primary key default extensions.gen_random_uuid(),
  registration_id uuid not null references public.registrations(id) on delete cascade,
  activity_date_id uuid not null references public.activity_dates(id) on delete cascade,
  session_starts_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index uq_activity_virtual_reminders_active_session
on public.activity_virtual_reminders(registration_id, session_starts_at)
where deleted_at is null;

create index idx_activity_virtual_reminders_registration
on public.activity_virtual_reminders(registration_id)
where deleted_at is null;

create trigger set_activity_virtual_reminders_updated_at
before update on public.activity_virtual_reminders
for each row execute function public.set_updated_at();

alter table public.activity_virtual_reminders enable row level security;
revoke all on table public.activity_virtual_reminders from public, anon, authenticated;
grant select on table public.activity_virtual_reminders to authenticated;
grant all on table public.activity_virtual_reminders to service_role;

create policy activity_virtual_reminders_internal_read
on public.activity_virtual_reminders
for select to authenticated
using ((select public.is_internal_user()));

create or replace function public.build_activity_virtual_notification_payload(
  p_registration_id uuid,
  p_session_starts_at timestamptz default null
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_strip_nulls(jsonb_build_object(
    'activity_id', activity.id,
    'activity_modality', activity.modality,
    'activity_sessions', (
      select coalesce(jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
        'ends_at', activity_date.ends_at,
        'label', activity_date.label,
        'starts_at', activity_date.starts_at
      )) order by activity_date.starts_at), '[]'::jsonb)
      from public.activity_dates activity_date
      where activity_date.activity_id = activity.id
        and activity_date.deleted_at is null
        and coalesce(activity_date.ends_at, activity_date.starts_at + interval '8 hours') > now()
    ),
    'activity_slug', activity.slug,
    'activity_title', activity.title,
    'activity_type', activity.type,
    'contact_email', coalesce(contact.email, activity.contact_email),
    'registration_code', registration.registration_code,
    'registration_request_token', registration.certificate_request_token,
    'session_starts_at', p_session_starts_at,
    'venue_address', coalesce(venue.address, activity.address),
    'venue_name', coalesce(venue.name, activity.location_name),
    'venue_reference', venue.reference,
    'virtual_access_url', access.virtual_url
  ))
  from public.registrations registration
  join public.activities activity on activity.id = registration.activity_id
  left join public.activity_virtual_access access on access.activity_id = activity.id
  left join public.activity_contacts contact
    on contact.id = activity.contact_id and contact.deleted_at is null
  left join public.venues venue
    on venue.id = activity.venue_id and venue.deleted_at is null
  where registration.id = p_registration_id
    and registration.deleted_at is null
    and registration.status = 'confirmed'
    and activity.deleted_at is null
    and activity.status = 'published';
$$;

revoke execute on function public.build_activity_virtual_notification_payload(uuid, timestamptz)
from public, anon, authenticated;
grant execute on function public.build_activity_virtual_notification_payload(uuid, timestamptz)
to service_role;

create or replace function public.sync_activity_virtual_reminders(p_activity_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_candidate record;
  v_payload jsonb;
  v_reminder_id uuid;
  v_scheduled integer := 0;
begin
  -- Retire only notifications that have not been delivered; sent rows remain as history.
  update public.notification_outbox notification
  set
    deleted_at = now(),
    next_attempt_at = null
  from public.activity_virtual_reminders reminder
  join public.registrations registration on registration.id = reminder.registration_id
  join public.activities activity on activity.id = registration.activity_id
  where activity.id = p_activity_id
    and notification.related_entity_type = 'activity_virtual_reminder'
    and notification.related_entity_id = reminder.id
    and notification.event_type = 'activity_virtual_session_reminder'
    and notification.status in ('pending', 'failed', 'processing')
    and notification.deleted_at is null
    and (
      registration.deleted_at is not null
      or registration.status <> 'confirmed'
      or activity.deleted_at is not null
      or activity.status <> 'published'
      or activity.modality not in ('virtual', 'hybrid')
      or not exists (
        select 1
        from public.activity_dates activity_date
        where activity_date.activity_id = activity.id
          and activity_date.deleted_at is null
          and activity_date.starts_at = reminder.session_starts_at
          and activity_date.starts_at > now()
      )
      or not exists (
        select 1 from public.activity_virtual_access access
        where access.activity_id = activity.id
      )
    );

  update public.activity_virtual_reminders reminder
  set deleted_at = now()
  where reminder.deleted_at is null
    and exists (
      select 1
      from public.registrations registration
      where registration.id = reminder.registration_id
        and registration.activity_id = p_activity_id
    )
    and exists (
      select 1
      from public.notification_outbox notification
      where notification.related_entity_type = 'activity_virtual_reminder'
        and notification.related_entity_id = reminder.id
        and notification.event_type = 'activity_virtual_session_reminder'
        and notification.deleted_at is not null
    );

  for v_candidate in
    select
      activity_date.id as activity_date_id,
      activity_date.starts_at,
      people.email,
      registration.id as registration_id,
      registration.person_id
    from public.activities activity
    join public.activity_virtual_access access on access.activity_id = activity.id
    join public.activity_dates activity_date
      on activity_date.activity_id = activity.id and activity_date.deleted_at is null
    join public.registrations registration
      on registration.activity_id = activity.id
      and registration.deleted_at is null
      and registration.status = 'confirmed'
    join public.people people on people.id = registration.person_id
    where activity.id = p_activity_id
      and activity.deleted_at is null
      and activity.status = 'published'
      and activity.modality in ('virtual', 'hybrid')
      and activity_date.starts_at - interval '1 hour' > now()
  loop
    insert into public.activity_virtual_reminders (
      registration_id,
      activity_date_id,
      session_starts_at
    ) values (
      v_candidate.registration_id,
      v_candidate.activity_date_id,
      v_candidate.starts_at
    )
    on conflict (registration_id, session_starts_at)
      where deleted_at is null
    do update set activity_date_id = excluded.activity_date_id
    returning id into v_reminder_id;

    v_payload := public.build_activity_virtual_notification_payload(
      v_candidate.registration_id,
      v_candidate.starts_at
    );

    insert into public.notification_outbox (
      person_id,
      event_type,
      recipient_email,
      related_entity_type,
      related_entity_id,
      payload,
      next_attempt_at
    ) values (
      v_candidate.person_id,
      'activity_virtual_session_reminder',
      v_candidate.email,
      'activity_virtual_reminder',
      v_reminder_id,
      v_payload,
      v_candidate.starts_at - interval '1 hour'
    )
    on conflict (event_type, related_entity_type, related_entity_id)
      where deleted_at is null and related_entity_id is not null
    do update set
      payload = excluded.payload,
      recipient_email = excluded.recipient_email,
      next_attempt_at = excluded.next_attempt_at
    where notification_outbox.status in ('pending', 'failed');

    v_scheduled := v_scheduled + 1;
  end loop;

  return v_scheduled;
end;
$$;

revoke execute on function public.sync_activity_virtual_reminders(uuid)
from public, anon, authenticated;
grant execute on function public.sync_activity_virtual_reminders(uuid) to service_role;

create or replace function public.sync_registration_virtual_reminders()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.sync_activity_virtual_reminders(new.activity_id);
  return new;
end;
$$;

create trigger sync_registration_virtual_reminders_after_write
after insert or update of status, deleted_at on public.registrations
for each row execute function public.sync_registration_virtual_reminders();

create or replace function public.sync_activity_virtual_reminders_after_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.sync_activity_virtual_reminders(new.id);
  return new;
end;
$$;

create trigger sync_activity_virtual_reminders_after_write
after update of status, modality, deleted_at on public.activities
for each row execute function public.sync_activity_virtual_reminders_after_write();

create or replace function public.sync_activity_virtual_reminders_after_access_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_activity_id uuid;
begin
  if tg_op = 'DELETE' then
    v_activity_id := old.activity_id;
  else
    v_activity_id := new.activity_id;
  end if;

  perform public.sync_activity_virtual_reminders(v_activity_id);
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

create trigger sync_activity_virtual_reminders_after_access_write
after insert or update of virtual_url or delete on public.activity_virtual_access
for each row execute function public.sync_activity_virtual_reminders_after_access_write();

alter function public.save_activity(jsonb, jsonb, jsonb)
rename to save_activity_with_legacy_virtual_url;

revoke execute on function public.save_activity_with_legacy_virtual_url(jsonb, jsonb, jsonb)
from public, anon, authenticated, service_role;

create or replace function public.save_activity(
  p_activity jsonb,
  p_dates jsonb,
  p_speakers jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_activity_id uuid;
  v_modality public.activity_modality := (p_activity->>'modality')::public.activity_modality;
  v_status public.activity_status := coalesce(
    nullif(p_activity->>'status', '')::public.activity_status,
    'draft'
  );
  v_virtual_url text := nullif(btrim(p_activity->>'virtual_url'), '');
begin
  if not public.is_active_admin() then
    raise exception 'No autorizado para gestionar actividades.' using errcode = '42501';
  end if;

  if v_modality = 'in_person' then
    v_virtual_url := null;
  end if;

  if v_status = 'published'
    and v_modality in ('virtual', 'hybrid')
    and v_virtual_url is null
  then
    raise exception 'Indica el enlace virtual antes de publicar.'
      using errcode = '23514', constraint = 'activities_published_virtual_access_required';
  end if;

  if v_virtual_url is not null and v_virtual_url !~* '^https://[^[:space:]]+$' then
    raise exception 'El enlace virtual debe ser una URL HTTPS válida.'
      using errcode = '23514', constraint = 'activity_virtual_access_url_valid';
  end if;

  v_activity_id := public.save_activity_with_legacy_virtual_url(
    p_activity || jsonb_build_object('virtual_url', null),
    p_dates,
    p_speakers
  );

  if v_virtual_url is null then
    delete from public.activity_virtual_access where activity_id = v_activity_id;
  else
    insert into public.activity_virtual_access (activity_id, virtual_url, updated_by)
    values (v_activity_id, v_virtual_url, auth.uid())
    on conflict (activity_id) do update set
      virtual_url = excluded.virtual_url,
      updated_by = excluded.updated_by;
  end if;

  perform public.sync_activity_virtual_reminders(v_activity_id);
  return v_activity_id;
end;
$$;

revoke execute on function public.save_activity(jsonb, jsonb, jsonb) from public, anon;
grant execute on function public.save_activity(jsonb, jsonb, jsonb) to authenticated, service_role;

alter function public.set_activity_status(uuid, public.activity_status)
rename to set_activity_status_without_virtual_validation;

revoke execute on function public.set_activity_status_without_virtual_validation(uuid, public.activity_status)
from public, anon, authenticated, service_role;

create or replace function public.set_activity_status(
  p_activity_id uuid,
  p_status public.activity_status
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_activity public.activities%rowtype;
  v_result uuid;
begin
  if not public.is_active_admin() then
    raise exception 'No autorizado para cambiar el estado.' using errcode = '42501';
  end if;

  select * into v_activity
  from public.activities
  where id = p_activity_id and deleted_at is null;

  if not found then
    raise exception 'La actividad no existe o fue eliminada.' using errcode = 'P0002';
  end if;

  if p_status = 'published'
    and v_activity.modality in ('virtual', 'hybrid')
    and not exists (
      select 1 from public.activity_virtual_access access
      where access.activity_id = p_activity_id
    )
  then
    raise exception 'Indica el enlace virtual antes de publicar.'
      using errcode = '23514', constraint = 'activities_published_virtual_access_required';
  end if;

  v_result := public.set_activity_status_without_virtual_validation(p_activity_id, p_status);
  perform public.sync_activity_virtual_reminders(p_activity_id);
  return v_result;
end;
$$;

revoke execute on function public.set_activity_status(uuid, public.activity_status) from public, anon;
grant execute on function public.set_activity_status(uuid, public.activity_status) to authenticated, service_role;

create or replace function public.enrich_activity_certificate_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_context record;
  v_virtual_payload jsonb;
begin
  if new.related_entity_type <> 'registration'
    or new.related_entity_id is null
  then
    return new;
  end if;

  select
    activity.certificate_mode as current_certificate_mode,
    coalesce(contact.email, activity.contact_email) as contact_email,
    coalesce(contact.contact_name, activity.contact_name) as contact_name,
    coalesce(contact.whatsapp_phone, activity.contact_phone) as contact_phone,
    registration.certificate_mode_snapshot,
    registration.certificate_price_snapshot,
    registration.certificate_request_token,
    registration.certificate_requested_at,
    registration.registration_type
  into v_context
  from public.registrations registration
  join public.activities activity on activity.id = registration.activity_id
  left join public.activity_contacts contact
    on contact.id = activity.contact_id and contact.deleted_at is null
  where registration.id = new.related_entity_id;

  if not found then
    return new;
  end if;

  new.payload := coalesce(new.payload, '{}'::jsonb) || jsonb_strip_nulls(
    jsonb_build_object(
      'certificate_mode', case
        when v_context.current_certificate_mode = 'none' then 'none'
        when v_context.current_certificate_mode = 'included' then 'included'
        else v_context.certificate_mode_snapshot
      end,
      'certificate_price', case
        when v_context.current_certificate_mode = 'optional_paid'
          then v_context.certificate_price_snapshot
        else null
      end,
      'certificate_request_token', v_context.certificate_request_token,
      'certificate_requested', v_context.certificate_requested_at is not null,
      'certificate_requested_at', v_context.certificate_requested_at,
      'contact_email', v_context.contact_email,
      'contact_name', v_context.contact_name,
      'contact_whatsapp_phone', v_context.contact_phone,
      'registration_type', v_context.registration_type
    )
  );

  if new.event_type in (
    'activity_free_registration_confirmed',
    'activity_paid_registration_confirmed'
  ) then
    v_virtual_payload := public.build_activity_virtual_notification_payload(
      new.related_entity_id,
      null
    );
    new.payload := new.payload || coalesce(v_virtual_payload, '{}'::jsonb);
  end if;

  return new;
end;
$$;

create or replace function public.get_public_registration_result_secure(
  p_registration_code text,
  p_request_token uuid
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'activity_modality', activity.modality,
    'activity_sessions', (
      select coalesce(jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
        'ends_at', activity_date.ends_at,
        'label', activity_date.label,
        'starts_at', activity_date.starts_at
      )) order by activity_date.starts_at), '[]'::jsonb)
      from public.activity_dates activity_date
      where activity_date.activity_id = activity.id
        and activity_date.deleted_at is null
        and coalesce(activity_date.ends_at, activity_date.starts_at + interval '8 hours') > now()
    ),
    'activity_slug', activity.slug,
    'activity_title', activity.title,
    'activity_type', activity.type,
    'certificate_mode', case
      when activity.certificate_mode = 'none' then 'none'
      when activity.certificate_mode = 'included' then 'included'
      else registration.certificate_mode_snapshot
    end,
    'certificate_price', case
      when activity.certificate_mode = 'optional_paid' then registration.certificate_price_snapshot
      else null
    end,
    'certificate_request_token', registration.certificate_request_token,
    'certificate_requested_at', registration.certificate_requested_at,
    'contact_email', coalesce(contact.email, activity.contact_email),
    'contact_name', coalesce(contact.contact_name, activity.contact_name),
    'contact_phone', coalesce(contact.whatsapp_phone, activity.contact_phone),
    'is_free', activity.is_free,
    'price_snapshot', registration.price_snapshot,
    'registration_code', registration.registration_code,
    'registration_type', registration.registration_type,
    'status', registration.status,
    'venue_address', coalesce(venue.address, activity.address),
    'venue_name', coalesce(venue.name, activity.location_name),
    'venue_reference', venue.reference,
    'virtual_access_url', case
      when registration.status = 'confirmed'
        and activity.status = 'published'
        and activity.modality in ('virtual', 'hybrid')
        and exists (
          select 1 from public.activity_dates available_date
          where available_date.activity_id = activity.id
            and available_date.deleted_at is null
            and coalesce(available_date.ends_at, available_date.starts_at + interval '8 hours') > now()
        )
      then access.virtual_url
      else null
    end
  )
  from public.registrations registration
  join public.activities activity on activity.id = registration.activity_id
  left join public.activity_contacts contact
    on contact.id = activity.contact_id and contact.deleted_at is null
  left join public.venues venue
    on venue.id = activity.venue_id and venue.deleted_at is null
  left join public.activity_virtual_access access on access.activity_id = activity.id
  where registration.registration_code = upper(btrim(p_registration_code))
    and registration.certificate_request_token = p_request_token
    and registration.deleted_at is null
    and activity.deleted_at is null
    and activity.status <> 'archived';
$$;

revoke execute on function public.get_public_registration_result_secure(text, uuid) from public;
grant execute on function public.get_public_registration_result_secure(text, uuid)
to anon, authenticated, service_role;

create or replace function public.claim_due_virtual_reminders(p_limit integer default 20)
returns setof public.notification_outbox
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_limit < 1 or p_limit > 100 then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  update public.notification_outbox
  set status = 'pending'
  where event_type = 'activity_virtual_session_reminder'
    and status = 'processing'
    and updated_at <= now() - interval '15 minutes'
    and attempts < 5
    and deleted_at is null;

  return query
  with claimable as (
    select id
    from public.notification_outbox
    where event_type = 'activity_virtual_session_reminder'
      and status in ('pending', 'failed')
      and attempts < 5
      and (next_attempt_at is null or next_attempt_at <= now())
      and nullif(payload->>'session_starts_at', '')::timestamptz > now()
      and deleted_at is null
    order by next_attempt_at nulls first, created_at
    for update skip locked
    limit p_limit
  )
  update public.notification_outbox notification
  set
    status = 'processing',
    attempts = notification.attempts + 1,
    last_error = null
  from claimable
  where notification.id = claimable.id
  returning notification.*;
end;
$$;

revoke execute on function public.claim_due_virtual_reminders(integer)
from public, anon, authenticated;
grant execute on function public.claim_due_virtual_reminders(integer) to service_role;

do $$
declare
  v_activity_id uuid;
begin
  for v_activity_id in
    select activity.id
    from public.activities activity
    where activity.status = 'published'
      and activity.modality in ('virtual', 'hybrid')
      and activity.deleted_at is null
  loop
    perform public.sync_activity_virtual_reminders(v_activity_id);
  end loop;
end;
$$;

revoke execute on function public.sync_registration_virtual_reminders() from public, anon, authenticated;
revoke execute on function public.sync_activity_virtual_reminders_after_write() from public, anon, authenticated;
revoke execute on function public.sync_activity_virtual_reminders_after_access_write() from public, anon, authenticated;
revoke execute on function public.clear_legacy_activity_virtual_url() from public, anon, authenticated;
revoke execute on function public.validate_published_activity_virtual_access() from public, anon, authenticated;

comment on table public.activity_virtual_access is
  'Private one-to-one virtual access configuration for activities.';
comment on table public.activity_virtual_reminders is
  'Persistent identity for one virtual access reminder per confirmed registration and session.';
comment on function public.claim_due_virtual_reminders(integer) is
  'Claims due virtual session reminders and recovers processing rows stalled for 15 minutes.';
