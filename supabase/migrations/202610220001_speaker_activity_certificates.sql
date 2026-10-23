create type public.certificate_recipient_type as enum ('participant', 'student', 'speaker');

alter table public.certificates
  add column recipient_type public.certificate_recipient_type not null default 'participant',
  add column activity_id uuid references public.activities(id) on delete restrict,
  add column speaker_id uuid references public.speakers(id) on delete restrict,
  add column template_snapshot jsonb,
  add column generation_lease_token uuid,
  add column generation_lease_until timestamptz,
  alter column person_id drop not null;

update public.certificates
set recipient_type = 'student'
where certificate_type = 'course';

alter table public.certificates
  drop constraint certificates_origin_exactly_one,
  drop constraint certificates_origin_matches_type,
  add constraint certificates_recipient_origin_valid check (
    (recipient_type = 'participant' and certificate_type = 'activity' and person_id is not null
      and registration_id is not null and course_enrollment_id is null and activity_id is null and speaker_id is null)
    or
    (recipient_type = 'student' and certificate_type = 'course' and person_id is not null
      and registration_id is null and course_enrollment_id is not null and activity_id is null and speaker_id is null)
    or
    (recipient_type = 'speaker' and certificate_type = 'activity' and person_id is null
      and registration_id is null and course_enrollment_id is null and activity_id is not null and speaker_id is not null
      and academic_hours_snapshot is null and template_snapshot is not null and jsonb_typeof(template_snapshot) = 'object')
  );

create unique index uq_certificates_activity_speaker_active
on public.certificates(activity_id, speaker_id)
where recipient_type = 'speaker' and deleted_at is null;

create index idx_certificates_speaker
on public.certificates(speaker_id, issued_at desc)
where recipient_type = 'speaker' and deleted_at is null;

create function public.normalize_certificate_recipient_type()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.certificate_type = 'course' then
    new.recipient_type := 'student';
  elsif new.activity_id is not null and new.speaker_id is not null then
    new.recipient_type := 'speaker';
  else
    new.recipient_type := 'participant';
  end if;
  return new;
end;
$$;

create trigger normalize_certificate_recipient_type
before insert or update of certificate_type, registration_id, course_enrollment_id, activity_id, speaker_id
on public.certificates for each row execute function public.normalize_certificate_recipient_type();

create function public.get_speaker_certificate_activity_summaries(
  p_query text default null,
  p_type public.activity_type default null,
  p_limit integer default 12,
  p_offset integer default 0
)
returns table (
  id uuid,
  title text,
  type public.activity_type,
  speaker_count bigint,
  issued_count bigint,
  pending_count bigint,
  total_count bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_active_admin() then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  if p_limit < 1 or p_limit > 100 or p_offset < 0 then raise exception 'VALIDATION_ERROR' using errcode = '22023'; end if;
  return query
  with filtered as (
    select activity.id, activity.title::text as title, activity.type
    from public.activities activity
    where activity.deleted_at is null
      and (p_type is null or activity.type = p_type)
      and (nullif(btrim(p_query), '') is null or position(lower(btrim(p_query)) in lower(activity.title)) > 0)
      and (exists (
        select 1 from public.activity_speakers link
        join public.speakers speaker on speaker.id = link.speaker_id and speaker.deleted_at is null
        where link.activity_id = activity.id and link.deleted_at is null
      ) or exists (select 1 from public.certificates c where c.activity_id = activity.id and c.recipient_type = 'speaker' and c.deleted_at is null))
  )
  select filtered.id, filtered.title, filtered.type,
    (select count(*) from public.activity_speakers link
      join public.speakers speaker on speaker.id = link.speaker_id and speaker.deleted_at is null
      where link.activity_id = filtered.id and link.deleted_at is null) as speaker_count,
    (select count(*) from public.certificates certificate
      where certificate.activity_id = filtered.id and certificate.recipient_type = 'speaker'
        and certificate.deleted_at is null and certificate.file_path is not null) as issued_count,
    (select count(*) from public.activity_speakers link
      join public.speakers speaker on speaker.id = link.speaker_id and speaker.deleted_at is null
      left join public.certificates certificate on certificate.activity_id = link.activity_id
        and certificate.speaker_id = link.speaker_id and certificate.recipient_type = 'speaker' and certificate.deleted_at is null
      where link.activity_id = filtered.id and link.deleted_at is null
        and (certificate.id is null or (certificate.file_path is null and certificate.status <> 'revoked'))) as pending_count,
    count(*) over() as total_count
  from filtered
  order by filtered.title
  limit p_limit offset p_offset;
end;
$$;

create function public.get_speaker_certificate_candidates(p_activity_id uuid)
returns table (
  speaker_id uuid,
  first_names text,
  last_names text,
  organization text,
  photo_path text,
  role_label text,
  email text,
  certificate_id uuid,
  certificate_code text,
  certificate_status public.certificate_status,
  file_path text,
  access_token uuid
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_active_admin() then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  if not exists (select 1 from public.activities where id = p_activity_id and deleted_at is null) then
    raise exception 'ACTIVITY_NOT_AVAILABLE' using errcode = 'P0001';
  end if;
  return query
  select speaker.id, speaker.first_names::text, speaker.last_names::text, speaker.organization,
    speaker.photo_path, coalesce(certificate.condition_snapshot, nullif(btrim(link.role_label), ''), 'Ponente'), private.email,
    certificate.id, certificate.certificate_code::text, certificate.status, certificate.file_path, certificate.access_token
  from (select distinct keys.speaker_id from (
    select l.speaker_id from public.activity_speakers l where l.activity_id = p_activity_id and l.deleted_at is null
    union select c.speaker_id from public.certificates c where c.activity_id = p_activity_id and c.recipient_type = 'speaker' and c.deleted_at is null
  ) keys) assigned
  join public.speakers speaker on speaker.id = assigned.speaker_id
  left join public.activity_speakers link on link.activity_id = p_activity_id and link.speaker_id = speaker.id and link.deleted_at is null
  left join public.speaker_private_details private on private.speaker_id = speaker.id
  left join public.certificates certificate on certificate.activity_id = p_activity_id
    and certificate.speaker_id = speaker.id and certificate.recipient_type = 'speaker'
    and certificate.deleted_at is null
  where certificate.id is not null or speaker.deleted_at is null
  order by link.sort_order, speaker.last_names, speaker.first_names;
end;
$$;

create function public.prepare_speaker_certificates(
  p_activity_id uuid,
  p_template_id uuid,
  p_recipients jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_activity public.activities%rowtype;
  v_item jsonb;
  v_speaker record;
  v_existing public.certificates%rowtype;
  v_certificate public.certificates%rowtype;
  v_role text;
  v_date_text text;
  v_prepared jsonb := '[]'::jsonb;
  v_existing_items jsonb := '[]'::jsonb;
  v_rejected jsonb := '[]'::jsonb;
begin
  if not public.is_active_admin() then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  if p_recipients is null or jsonb_typeof(p_recipients) <> 'array' or jsonb_array_length(p_recipients) < 1 or jsonb_array_length(p_recipients) > 100 then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;
  select * into v_activity from public.activities
  where id = p_activity_id and deleted_at is null for update;
  if not found then raise exception 'ACTIVITY_NOT_FOUND' using errcode = 'P0001'; end if;
  if v_activity.status = 'archived' then raise exception 'ACTIVITY_ARCHIVED' using errcode = 'P0001'; end if;

  select case when count(*) = 0 then null
    when (min(starts_at) at time zone 'America/Lima')::date = (max(starts_at) at time zone 'America/Lima')::date then to_char(min(starts_at) at time zone 'America/Lima', 'DD/MM/YYYY')
    else concat(to_char(min(starts_at) at time zone 'America/Lima', 'DD/MM/YYYY'), ' - ', to_char(max(starts_at) at time zone 'America/Lima', 'DD/MM/YYYY')) end
  into v_date_text from public.activity_dates where activity_id = p_activity_id and deleted_at is null;

  for v_item in select value from jsonb_array_elements(p_recipients)
  loop
    if nullif(v_item->>'speaker_id', '') is null or (v_item->>'speaker_id') !~ '^[0-9a-fA-F-]{36}$' then
      raise exception 'VALIDATION_ERROR' using errcode = '22023';
    end if;
    v_role := coalesce(nullif(btrim(v_item->>'role'), ''), 'Ponente');
    if length(v_role) > 120 then raise exception 'VALIDATION_ERROR' using errcode = '22023'; end if;
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('speaker-certificate:' || p_activity_id::text || ':' || (v_item->>'speaker_id'), 0));

    select speaker.id, speaker.first_names, speaker.last_names into v_speaker
    from public.activity_speakers link
    join public.speakers speaker on speaker.id = link.speaker_id and speaker.deleted_at is null
    where link.activity_id = p_activity_id and link.speaker_id = (v_item->>'speaker_id')::uuid and link.deleted_at is null;
    if not found then
      v_rejected := v_rejected || jsonb_build_array(jsonb_build_object('speaker_id', v_item->>'speaker_id', 'reason', 'SPEAKER_NOT_ASSIGNED'));
      continue;
    end if;

    select * into v_existing from public.certificates
    where activity_id = p_activity_id and speaker_id = v_speaker.id and recipient_type = 'speaker' and deleted_at is null;
    if found then
      if v_existing.status = 'revoked' then
        v_rejected := v_rejected || jsonb_build_array(jsonb_build_object('speaker_id', v_speaker.id, 'reason', 'CERTIFICATE_REVOKED'));
        continue;
      end if;
      v_existing_items := v_existing_items || jsonb_build_array(jsonb_build_object(
        'certificate_id', v_existing.id, 'speaker_id', v_speaker.id, 'file_ready', v_existing.file_path is not null));
      continue;
    end if;

    if not exists (select 1 from public.certificate_templates where id = p_template_id and scope = 'activity' and is_active and deleted_at is null) then
      raise exception 'TEMPLATE_NOT_AVAILABLE' using errcode = 'P0001';
    end if;

    insert into public.certificates (
      person_id, template_id, registration_id, course_enrollment_id, certificate_type, recipient_type,
      activity_id, speaker_id, certificate_code, participant_name_snapshot, title_snapshot,
      condition_snapshot, date_text_snapshot, academic_hours_snapshot, issued_by, template_snapshot
    ) values (
      null, p_template_id, null, null, 'activity', 'speaker', p_activity_id, v_speaker.id,
      concat('CCI-PON-', extract(year from now())::integer, '-', lpad(nextval('public.certificate_code_seq'::regclass)::text, 6, '0')),
      concat_ws(' ', v_speaker.first_names, v_speaker.last_names), v_activity.title, v_role,
      v_date_text, null, auth.uid(),
      (select to_jsonb(template) || jsonb_build_object('signers',
        (select coalesce(jsonb_agg(to_jsonb(signer) order by signer.sort_order), '[]'::jsonb)
         from public.certificate_template_signers signer where signer.template_id = template.id and signer.deleted_at is null))
       from public.certificate_templates template where template.id = p_template_id)
    ) returning * into v_certificate;
    v_prepared := v_prepared || jsonb_build_array(jsonb_build_object(
      'certificate_id', v_certificate.id, 'speaker_id', v_speaker.id));
  end loop;
  return jsonb_build_object('prepared', v_prepared, 'existing', v_existing_items, 'rejected', v_rejected);
end;
$$;

create function public.finalize_speaker_certificate(
  p_certificate_id uuid,
  p_file_path text,
  p_public_base_url text,
  p_lease_token uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_certificate public.certificates%rowtype;
  v_email text;
  v_notification_queued boolean := false;
begin
  if not public.is_active_admin() then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  if p_file_path is null or p_public_base_url is null or length(btrim(p_file_path)) < 5 or length(btrim(p_public_base_url)) < 8 then raise exception 'VALIDATION_ERROR' using errcode = '22023'; end if;
  select * into v_certificate from public.certificates
  where id = p_certificate_id and recipient_type = 'speaker' and deleted_at is null for update;
  if not found then raise exception 'CERTIFICATE_NOT_FOUND' using errcode = 'P0001'; end if;
  if v_certificate.status = 'revoked' then raise exception 'CERTIFICATE_REVOKED' using errcode = 'P0001'; end if;
  if not exists (select 1 from public.activities where id = v_certificate.activity_id and deleted_at is null and status <> 'archived')
    or not exists (select 1 from public.activity_speakers where activity_id = v_certificate.activity_id and speaker_id = v_certificate.speaker_id and deleted_at is null)
  then raise exception 'ACTIVITY_NOT_AVAILABLE' using errcode = 'P0001'; end if;
  if v_certificate.file_path is not null then
    return jsonb_build_object('changed', false, 'certificate_id', v_certificate.id, 'notification_queued', false);
  end if;
  if p_lease_token is null or v_certificate.generation_lease_token is distinct from p_lease_token
    or v_certificate.generation_lease_until is null or v_certificate.generation_lease_until < now() then raise exception 'GENERATION_LEASE_EXPIRED' using errcode = '40001'; end if;
  if p_file_path !~ ('^issued/' || v_certificate.id::text || '/' || p_lease_token::text || '[.]pdf$')
    or p_public_base_url !~ '^https://' then raise exception 'VALIDATION_ERROR' using errcode = '22023'; end if;
  update public.certificates set file_path = btrim(p_file_path), generation_lease_token = null,
    generation_lease_until = null where id = v_certificate.id returning * into v_certificate;
  select nullif(btrim(email), '') into v_email from public.speaker_private_details where speaker_id = v_certificate.speaker_id;
  if v_email is not null then
    insert into public.notification_outbox (person_id, event_type, recipient_email, related_entity_type, related_entity_id, payload)
    values (null, 'speaker_certificate_issued', v_email, 'certificate', v_certificate.id, jsonb_build_object(
      'certificate_code', v_certificate.certificate_code,
      'certificate_url', concat(rtrim(p_public_base_url, '/'), '/certificados/', v_certificate.access_token),
      'participant_name', v_certificate.participant_name_snapshot,
      'activity_title', v_certificate.title_snapshot,
      'condition', v_certificate.condition_snapshot
    )) on conflict (event_type, related_entity_type, related_entity_id)
      where deleted_at is null and related_entity_id is not null do nothing;
    v_notification_queued := true;
  end if;
  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, new_data)
  values (auth.uid(), 'speaker_certificate.issued', 'certificate', v_certificate.id, to_jsonb(v_certificate));
  return jsonb_build_object('changed', true, 'certificate_id', v_certificate.id, 'notification_queued', v_notification_queued);
end;
$$;

create or replace function public.is_activity_certificate_visible(p_certificate_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((select case
    when certificate.certificate_type = 'course' then true
    when certificate.recipient_type = 'speaker' then exists (
      select 1 from public.activities activity where activity.id = certificate.activity_id
        and activity.deleted_at is null and activity.status <> 'archived')
    else exists (
      select 1 from public.registrations registration join public.activities activity on activity.id = registration.activity_id
      where registration.id = certificate.registration_id and registration.deleted_at is null
        and activity.deleted_at is null and activity.status <> 'archived') end
  from public.certificates certificate where certificate.id = p_certificate_id and certificate.deleted_at is null), false);
$$;

create or replace function public.get_public_certificate(p_access_token text)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'certificate_code', certificate.certificate_code, 'certificate_type', certificate.certificate_type,
    'recipient_type', certificate.recipient_type, 'status', certificate.status,
    'participant_name', certificate.participant_name_snapshot, 'title', certificate.title_snapshot,
    'condition', certificate.condition_snapshot, 'date_text', certificate.date_text_snapshot,
    'academic_hours', certificate.academic_hours_snapshot, 'issued_at', certificate.issued_at,
    'revoked_at', certificate.revoked_at, 'revocation_reason', certificate.revocation_reason,
    'download_available', certificate.status = 'issued' and certificate.file_path is not null,
    'source_activity_id', coalesce(activity.id, speaker_activity.id),
    'source_activity_type', coalesce(activity.type, speaker_activity.type),
    'source_category_id', coalesce(activity.category_id, speaker_activity.category_id)
  )
  from public.certificates certificate
  left join public.registrations registration on registration.id = certificate.registration_id
  left join public.activities activity on activity.id = registration.activity_id
  left join public.activities speaker_activity on speaker_activity.id = certificate.activity_id and certificate.recipient_type = 'speaker'
  where certificate.access_token::text = lower(btrim(p_access_token)) and certificate.deleted_at is null
    and public.is_activity_certificate_visible(certificate.id)
  limit 1;
$$;

revoke all on function public.get_speaker_certificate_activity_summaries(text,public.activity_type,integer,integer) from public, anon;
revoke all on function public.get_speaker_certificate_candidates(uuid) from public, anon;
revoke all on function public.prepare_speaker_certificates(uuid,uuid,jsonb) from public, anon;
revoke all on function public.finalize_speaker_certificate(uuid,text,text,uuid) from public, anon;
grant execute on function public.get_speaker_certificate_activity_summaries(text,public.activity_type,integer,integer) to authenticated, service_role;
grant execute on function public.get_speaker_certificate_candidates(uuid) to authenticated, service_role;
grant execute on function public.prepare_speaker_certificates(uuid,uuid,jsonb) to authenticated, service_role;
grant execute on function public.finalize_speaker_certificate(uuid,text,text,uuid) to authenticated, service_role;

create function public.claim_speaker_certificate(p_certificate_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_token uuid := gen_random_uuid();
begin
  if not public.is_active_admin() then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  update public.certificates set generation_lease_token = v_token, generation_lease_until = now() + interval '5 minutes'
  where id = p_certificate_id and recipient_type = 'speaker' and status = 'issued' and file_path is null and deleted_at is null
    and (generation_lease_until is null or generation_lease_until < now());
  if not found then return null; end if;
  return v_token;
end;
$$;
revoke all on function public.claim_speaker_certificate(uuid) from public, anon;
grant execute on function public.claim_speaker_certificate(uuid) to authenticated, service_role;

comment on column public.certificates.recipient_type is 'Distingue participante, estudiante y ponente sin cambiar el origen actividad/curso.';

create function public.replace_speaker_certificate_file(p_certificate_id uuid, p_expected_file_path text, p_new_file_path text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_old public.certificates%rowtype;
begin
  if not public.is_active_admin() then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  select * into v_old from public.certificates where id = p_certificate_id and recipient_type = 'speaker'
    and status = 'issued' and deleted_at is null for update;
  if not found then raise exception 'CERTIFICATE_NOT_AVAILABLE'; end if;
  if not exists (select 1 from public.activities where id = v_old.activity_id and status <> 'archived' and deleted_at is null)
    then raise exception 'ACTIVITY_ARCHIVED'; end if;
  if p_new_file_path is null or p_new_file_path !~ ('^issued/' || p_certificate_id::text || '/[A-Za-z0-9-]+[.]pdf$')
    or p_new_file_path = p_expected_file_path or v_old.file_path is distinct from p_expected_file_path
    then raise exception 'CERTIFICATE_CHANGED' using errcode = '40001'; end if;
  update public.certificates set file_path = p_new_file_path where id = p_certificate_id;
  insert into public.audit_logs(actor_user_id, action, entity_type, entity_id, old_data, new_data)
  values (auth.uid(), 'speaker_certificate.regenerated', 'certificate', p_certificate_id, to_jsonb(v_old), jsonb_build_object('file_path', p_new_file_path));
  return true;
end;
$$;
revoke all on function public.replace_speaker_certificate_file(uuid,text,text) from public, anon;
grant execute on function public.replace_speaker_certificate_file(uuid,text,text) to authenticated, service_role;

create function public.guard_speaker_certificate_archive()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.recipient_type = 'speaker' and exists (select 1 from public.activities where id = new.activity_id and status = 'archived')
    then raise exception 'ACTIVITY_ARCHIVED' using errcode = 'P0001'; end if;
  return new;
end;
$$;
create trigger guard_speaker_certificate_archive before insert or update on public.certificates
for each row execute function public.guard_speaker_certificate_archive();
