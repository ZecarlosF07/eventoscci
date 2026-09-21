-- Add professional/student context to public activity registrations without
-- changing the commercial registration_type used by pricing and courses.

create type public.participant_profile as enum ('professional', 'student');

alter table public.people
  alter column job_title drop not null,
  add column participant_profile public.participant_profile not null default 'professional',
  add column academic_institution text,
  add column career text;

alter table public.people
  add constraint people_profile_context_check check (
    (
      participant_profile = 'professional'
      and job_title is not null
      and length(btrim(job_title)) between 2 and 150
    )
    or (
      participant_profile = 'student'
      and academic_institution is not null
      and length(btrim(academic_institution)) between 2 and 180
      and career is not null
      and length(btrim(career)) between 2 and 180
    )
  ) not valid;

alter table public.registrations
  add column participant_profile public.participant_profile not null default 'professional',
  add column job_title_snapshot text,
  add column academic_institution_snapshot text,
  add column career_snapshot text,
  add column future_topics_suggestion text;

update public.registrations registration
set job_title_snapshot = people.job_title
from public.people people
where people.id = registration.person_id
  and registration.job_title_snapshot is null;

alter table public.registrations
  add constraint registrations_participant_context_check check (
    (
      participant_profile = 'professional'
      and job_title_snapshot is not null
      and length(btrim(job_title_snapshot)) between 2 and 150
      and academic_institution_snapshot is null
      and career_snapshot is null
    )
    or (
      participant_profile = 'student'
      and registration_type = 'general'
      and job_title_snapshot is null
      and company_snapshot is null
      and ruc_snapshot is null
      and academic_institution_snapshot is not null
      and length(btrim(academic_institution_snapshot)) between 2 and 180
      and career_snapshot is not null
      and length(btrim(career_snapshot)) between 2 and 180
    )
  ),
  add constraint registrations_future_topics_length_check check (
    future_topics_suggestion is null
    or length(future_topics_suggestion) <= 500
  );

alter table public.people validate constraint people_profile_context_check;

create index idx_registrations_participant_profile_active
on public.registrations(participant_profile)
where deleted_at is null;

create index idx_registrations_suggestions_active
on public.registrations(created_at desc)
where deleted_at is null and future_topics_suggestion is not null;

create or replace function public.register_activity_internal(
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
  v_address text := nullif(btrim(p_registration->>'address'), '');
  v_attendance_id uuid;
  v_career text := nullif(btrim(p_registration->>'career'), '');
  v_company text := nullif(btrim(p_registration->>'company'), '');
  v_document_number text := upper(btrim(p_registration->>'document_number'));
  v_document_type text := lower(btrim(p_registration->>'document_type'));
  v_email text := lower(btrim(p_registration->>'email'));
  v_event_type text;
  v_first_names text := btrim(p_registration->>'first_names');
  v_future_topics_suggestion text := nullif(btrim(p_registration->>'future_topics_suggestion'), '');
  v_academic_institution text := nullif(btrim(p_registration->>'academic_institution'), '');
  v_job_title text := nullif(btrim(p_registration->>'job_title'), '');
  v_last_names text := btrim(p_registration->>'last_names');
  v_participant_profile text := lower(coalesce(nullif(btrim(p_registration->>'participant_profile'), ''), 'professional'));
  v_person_id uuid;
  v_phone text := regexp_replace(btrim(p_registration->>'phone'), '[[:space:]-]', '', 'g');
  v_price numeric(10, 2);
  v_registration_code varchar(40);
  v_registration_id uuid;
  v_registration_status public.registration_status;
  v_registration_type text := lower(btrim(p_registration->>'registration_type'));
  v_ruc text := nullif(btrim(p_registration->>'ruc'), '');
begin
  if p_activity_id is null or p_registration is null then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  select * into v_activity
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
    or v_participant_profile not in ('professional', 'student')
    or v_first_names is null or length(v_first_names) < 2 or length(v_first_names) > 120
    or v_last_names is null or length(v_last_names) < 2 or length(v_last_names) > 120
    or v_email is null or length(v_email) > 320
    or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or v_phone is null or v_phone !~ '^\+?[0-9]{7,15}$'
    or (v_address is not null and length(v_address) > 250)
    or (v_company is not null and length(v_company) > 250)
    or (v_future_topics_suggestion is not null and length(v_future_topics_suggestion) > 500)
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

  if v_participant_profile = 'student' then
    if v_registration_type <> 'general'
      or v_academic_institution is null or length(v_academic_institution) > 180
      or v_career is null or length(v_career) > 180
    then
      raise exception 'VALIDATION_ERROR' using errcode = '22023';
    end if;
    v_job_title := null;
    v_company := null;
    v_ruc := null;
    v_address := null;
  elsif v_job_title is null or length(v_job_title) > 150 then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  else
    v_academic_institution := null;
    v_career := null;
  end if;

  if v_registration_type = 'member'
    and (v_participant_profile <> 'professional' or v_company is null or v_ruc is null)
  then
    raise exception 'INVALID_MEMBER_DATA' using errcode = '22023';
  end if;

  if v_activity.members_only and v_registration_type <> 'member' then
    raise exception 'INVALID_MEMBER_DATA' using errcode = 'P0001';
  end if;

  select count(*) into v_active_registration_count
  from public.registrations
  where activity_id = v_activity.id
    and status in ('pending', 'confirmed')
    and deleted_at is null;

  if v_activity.capacity is not null and v_active_registration_count >= v_activity.capacity then
    raise exception 'NO_AVAILABLE_CAPACITY' using errcode = 'P0001';
  end if;

  insert into public.people as existing (
    document_type, document_number, first_names, last_names, email, phone,
    participant_profile, job_title, academic_institution, career,
    company, ruc, address, deleted_at, deleted_by
  ) values (
    v_document_type::public.document_type, v_document_number, v_first_names,
    v_last_names, v_email, v_phone, v_participant_profile::public.participant_profile,
    v_job_title, v_academic_institution, v_career, v_company, v_ruc, v_address,
    null, null
  )
  on conflict (document_type, document_number) do update set
    email = excluded.email,
    phone = excluded.phone,
    participant_profile = excluded.participant_profile,
    job_title = case
      when excluded.participant_profile = 'student' then existing.job_title
      else excluded.job_title
    end,
    academic_institution = excluded.academic_institution,
    career = excluded.career,
    company = coalesce(excluded.company, existing.company),
    ruc = coalesce(excluded.ruc, existing.ruc),
    address = coalesce(excluded.address, existing.address),
    deleted_at = null,
    deleted_by = null
  returning id into v_person_id;

  if exists (
    select 1 from public.registrations
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
    'CCI-', case when v_activity.type = 'event' then 'EV-' else 'CA-' end,
    lpad(nextval('public.activity_registration_code_seq'::regclass)::text, 6, '0')
  );

  insert into public.registrations (
    activity_id, person_id, registration_code, registration_type,
    participant_profile, status, job_title_snapshot,
    academic_institution_snapshot, career_snapshot, company_snapshot,
    ruc_snapshot, future_topics_suggestion, price_snapshot, confirmed_at
  ) values (
    v_activity.id, v_person_id, v_registration_code,
    v_registration_type::public.registration_type,
    v_participant_profile::public.participant_profile, v_registration_status,
    v_job_title, v_academic_institution, v_career, v_company, v_ruc,
    v_future_topics_suggestion, v_price,
    case when v_registration_status = 'confirmed' then now() else null end
  ) returning id into v_registration_id;

  insert into public.attendance (registration_id)
  values (v_registration_id)
  returning id into v_attendance_id;

  insert into public.notification_outbox (
    person_id, event_type, recipient_email, related_entity_type,
    related_entity_id, payload
  ) values (
    v_person_id, v_event_type, v_email, 'registration', v_registration_id,
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

revoke execute on function public.register_activity_internal(uuid, jsonb)
from public, anon, authenticated;
grant execute on function public.register_activity_internal(uuid, jsonb)
to service_role;

create or replace function public.update_participant(
  p_person_id uuid,
  p_person jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_address text := nullif(btrim(p_person->>'address'), '');
  v_academic_institution text := nullif(btrim(p_person->>'academic_institution'), '');
  v_career text := nullif(btrim(p_person->>'career'), '');
  v_company text := nullif(btrim(p_person->>'company'), '');
  v_email text := lower(btrim(p_person->>'email'));
  v_first_names text := btrim(p_person->>'first_names');
  v_job_title text := nullif(btrim(p_person->>'job_title'), '');
  v_last_names text := btrim(p_person->>'last_names');
  v_new public.people%rowtype;
  v_old public.people%rowtype;
  v_participant_profile text := lower(coalesce(nullif(btrim(p_person->>'participant_profile'), ''), 'professional'));
  v_phone text := regexp_replace(btrim(p_person->>'phone'), '[[:space:]-]', '', 'g');
  v_ruc text := nullif(btrim(p_person->>'ruc'), '');
begin
  if not public.is_active_admin() then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;

  if v_participant_profile not in ('professional', 'student')
    or v_first_names is null or length(v_first_names) < 2 or length(v_first_names) > 120
    or v_last_names is null or length(v_last_names) < 2 or length(v_last_names) > 120
    or v_email is null or length(v_email) > 320
    or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or v_phone is null or v_phone !~ '^\+?[0-9]{7,15}$'
    or (v_ruc is not null and v_ruc !~ '^[0-9]{11}$')
  then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  if v_participant_profile = 'professional' then
    if v_job_title is null or length(v_job_title) > 150 then
      raise exception 'VALIDATION_ERROR' using errcode = '22023';
    end if;
    v_academic_institution := null;
    v_career := null;
  else
    if v_academic_institution is null or length(v_academic_institution) > 180
      or v_career is null or length(v_career) > 180
    then
      raise exception 'VALIDATION_ERROR' using errcode = '22023';
    end if;
    v_job_title := null;
    v_company := null;
    v_ruc := null;
    v_address := null;
  end if;

  select * into v_old
  from public.people
  where id = p_person_id and deleted_at is null
  for update;

  if not found then
    raise exception 'PARTICIPANT_NOT_FOUND' using errcode = 'P0001';
  end if;

  update public.people set
    first_names = v_first_names,
    last_names = v_last_names,
    email = v_email,
    phone = v_phone,
    participant_profile = v_participant_profile::public.participant_profile,
    job_title = v_job_title,
    academic_institution = v_academic_institution,
    career = v_career,
    company = v_company,
    ruc = v_ruc,
    address = v_address
  where id = v_old.id
  returning * into v_new;

  if to_jsonb(v_old) - array['updated_at'] = to_jsonb(v_new) - array['updated_at'] then
    return v_new.id;
  end if;

  insert into public.audit_logs (
    actor_user_id, action, entity_type, entity_id, old_data, new_data
  ) values (
    auth.uid(), 'participant.updated', 'person', v_new.id,
    to_jsonb(v_old), to_jsonb(v_new)
  );

  return v_new.id;
end;
$$;

revoke execute on function public.update_participant(uuid, jsonb)
from public, anon;
grant execute on function public.update_participant(uuid, jsonb)
to authenticated, service_role;

comment on type public.participant_profile is
  'Current professional or student context, independent from commercial registration type.';
comment on column public.registrations.future_topics_suggestion is
  'Optional participant suggestion for future events and trainings.';
