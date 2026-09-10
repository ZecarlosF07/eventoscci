-- Allow participants to register optional certificate interest with their registration.

create or replace function public.enrich_activity_certificate_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_context record;
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

  return new;
end;
$$;

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
  v_activity_ends_at timestamptz;
  v_context record;
  v_notification_id uuid;
  v_person_id uuid;
  v_registration public.registrations%rowtype;
  v_result jsonb;
  v_wants_certificate boolean := lower(coalesce(p_registration->>'request_certificate', 'false'))
    in ('true', '1');
begin
  select max(coalesce(activity_dates.ends_at, activity_dates.starts_at))
  into v_activity_ends_at
  from public.activity_dates
  where activity_dates.activity_id = p_activity_id
    and activity_dates.deleted_at is null;

  if v_activity_ends_at is not null and now() >= v_activity_ends_at then
    raise exception 'REGISTRATION_CLOSED' using errcode = 'P0001';
  end if;

  select id into v_person_id
  from public.people
  where document_type::text = lower(btrim(p_registration->>'document_type'))
    and document_number = upper(btrim(p_registration->>'document_number'));

  if v_person_id is not null and exists (
    select 1 from public.registrations
    where activity_id = p_activity_id
      and person_id = v_person_id
      and deleted_at is null
  ) then
    raise exception 'DUPLICATE_REGISTRATION' using errcode = '23505';
  end if;

  v_result := public.register_activity_internal(p_activity_id, p_registration);

  select * into strict v_registration
  from public.registrations
  where id = (v_result->>'registration_id')::uuid;

  if v_wants_certificate
    and v_registration.certificate_mode_snapshot = 'optional_paid'
    and v_registration.certificate_price_snapshot > 0
    and exists (
      select 1 from public.activities
      where id = v_registration.activity_id
        and certificate_mode = 'optional_paid'
        and deleted_at is null
        and status = 'published'
    )
  then
    update public.registrations
    set certificate_requested_at = now()
    where id = v_registration.id
    returning * into v_registration;

    select
      activity.id as activity_id,
      activity.slug as activity_slug,
      activity.title as activity_title,
      activity.type as activity_type,
      coalesce(contact.email, activity.contact_email) as contact_email,
      people.first_names,
      people.last_names,
      people.phone as participant_phone
    into strict v_context
    from public.activities activity
    join public.people people on people.id = v_registration.person_id
    left join public.activity_contacts contact
      on contact.id = activity.contact_id and contact.deleted_at is null
    where activity.id = v_registration.activity_id;

    update public.notification_outbox
    set payload = payload || jsonb_build_object(
      'certificate_requested', true,
      'certificate_requested_at', v_registration.certificate_requested_at
    )
    where related_entity_type = 'registration'
      and related_entity_id = v_registration.id
      and event_type = v_result->>'notification_event'
      and deleted_at is null;

    if v_context.contact_email is not null then
      insert into public.notification_outbox (
        person_id,
        event_type,
        recipient_email,
        related_entity_type,
        related_entity_id,
        payload
      ) values (
        v_registration.person_id,
        'activity_certificate_request_created',
        v_context.contact_email,
        'registration',
        v_registration.id,
        jsonb_build_object(
          'activity_id', v_context.activity_id,
          'activity_slug', v_context.activity_slug,
          'activity_title', v_context.activity_title,
          'activity_type', v_context.activity_type,
          'participant_name', concat_ws(' ', v_context.first_names, v_context.last_names),
          'participant_phone', v_context.participant_phone,
          'registration_id', v_registration.id,
          'registration_code', v_registration.registration_code,
          'responsible_email', v_context.contact_email,
          'requested_at', v_registration.certificate_requested_at
        )
      ) on conflict (event_type, related_entity_type, related_entity_id)
        where deleted_at is null and related_entity_id is not null
      do nothing
      returning id into v_notification_id;
    end if;

    insert into public.audit_logs (
      actor_user_id, action, entity_type, entity_id, old_data, new_data
    ) values (
      null,
      'registration.certificate_requested',
      'registration',
      v_registration.id,
      jsonb_build_object('certificate_requested_at', null),
      jsonb_build_object(
        'certificate_requested_at', v_registration.certificate_requested_at,
        'source', 'registration_form'
      )
    );
  end if;

  return v_result || jsonb_build_object(
    'certificate_mode', v_registration.certificate_mode_snapshot,
    'certificate_price', v_registration.certificate_price_snapshot,
    'certificate_request_notification_id', v_notification_id,
    'certificate_request_token', v_registration.certificate_request_token,
    'certificate_requested_at', v_registration.certificate_requested_at
  );
end;
$$;

revoke execute on function public.register_activity(uuid, jsonb) from public;
grant execute on function public.register_activity(uuid, jsonb) to anon, authenticated, service_role;

revoke execute on function public.enrich_activity_certificate_notification()
from public, anon, authenticated;

comment on function public.register_activity(uuid, jsonb) is
  'Registers an activity participant and atomically records optional certificate interest when selected.';
