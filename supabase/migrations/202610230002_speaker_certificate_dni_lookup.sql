-- Identity is separate from editable contact metadata and from PDF snapshots.
create table public.speaker_identity_documents (
  speaker_id uuid primary key references public.speakers(id) on delete restrict,
  document_number text not null unique check (document_number ~ '^[0-9]{8}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.speaker_identity_documents enable row level security;
revoke all on public.speaker_identity_documents from public, anon, authenticated, service_role;
grant select on public.speaker_identity_documents to authenticated, service_role;
create policy speaker_identity_internal_read on public.speaker_identity_documents
for select to authenticated using (public.is_internal_user());

create function public.get_speaker_document_context(p_speaker_ids uuid[])
returns table(speaker_id uuid, document_number text, has_certificates boolean, can_correct boolean)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_internal_user() then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  if coalesce(cardinality(p_speaker_ids), 0) > 1000 then raise exception 'VALIDATION_ERROR' using errcode = '22023'; end if;
  return query
  select s.id, d.document_number, history.has_certificates,
    d.document_number is null or not history.has_certificates or public.is_administrator()
  from public.speakers s
  left join public.speaker_identity_documents d on d.speaker_id = s.id
  cross join lateral (select exists(select 1 from public.certificates c
    where c.speaker_id = s.id and c.recipient_type = 'speaker') as has_certificates) history
  where s.id = any(p_speaker_ids);
end;
$$;

create function public.set_speaker_document(
  p_speaker_id uuid, p_document_number text, p_expected_document text default '',
  p_reason text default '', p_confirm_history boolean default false
)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_old text;
  v_new text := nullif(btrim(p_document_number), '');
  v_has_certificates boolean;
  v_conflict record;
begin
  if not public.is_internal_user() then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  -- Serialize identity changes with preparation/finalization, including first registration.
  perform 1 from public.speakers where id = p_speaker_id and deleted_at is null for update;
  if not found then raise exception 'SPEAKER_NOT_AVAILABLE' using errcode = 'P0001'; end if;
  if v_new is not null and v_new !~ '^[0-9]{8}$' then raise exception 'INVALID_SPEAKER_DNI' using errcode = '22023'; end if;
  select document_number into v_old from public.speaker_identity_documents where speaker_id = p_speaker_id;
  if coalesce(v_old, '') is distinct from coalesce(p_expected_document, '') then
    raise exception 'SPEAKER_DOCUMENT_CHANGED' using errcode = '40001';
  end if;
  if v_old is not distinct from v_new then return false; end if;
  select exists(select 1 from public.certificates where speaker_id = p_speaker_id and recipient_type = 'speaker') into v_has_certificates;
  if v_has_certificates and v_new is null then raise exception 'SPEAKER_DOCUMENT_REQUIRED' using errcode = 'P0001'; end if;
  if v_has_certificates and v_old is not null then
    if not public.is_administrator() then raise exception 'SPEAKER_DOCUMENT_ADMIN_REQUIRED' using errcode = '42501'; end if;
    if p_confirm_history is distinct from true or length(btrim(coalesce(p_reason, ''))) < 5 then
      raise exception 'SPEAKER_DOCUMENT_CONFIRMATION_REQUIRED' using errcode = '22023';
    end if;
  end if;
  if length(coalesce(p_reason, '')) > 500 then raise exception 'VALIDATION_ERROR' using errcode = '22023'; end if;
  if v_new is not null then
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('speaker-dni:' || v_new, 0));
    select s.id, concat_ws(' ', s.first_names, s.last_names) as name into v_conflict
    from public.speaker_identity_documents d join public.speakers s on s.id = d.speaker_id
    where d.document_number = v_new and d.speaker_id <> p_speaker_id;
    if found then raise exception 'SPEAKER_DOCUMENT_CONFLICT' using errcode = '23505',
      detail = jsonb_build_object('speakerId', v_conflict.id, 'name', v_conflict.name)::text; end if;
    insert into public.speaker_identity_documents(speaker_id, document_number)
    values(p_speaker_id, v_new) on conflict(speaker_id) do update
      set document_number = excluded.document_number, updated_at = now();
  else
    delete from public.speaker_identity_documents where speaker_id = p_speaker_id;
  end if;
  insert into public.audit_logs(actor_user_id, action, entity_type, entity_id, old_data, new_data)
  values(auth.uid(), case when v_old is null then 'speaker.document_registered' else 'speaker.document_corrected' end,
    'speaker_identity_document', p_speaker_id, jsonb_build_object('document_number', v_old),
    jsonb_build_object('document_number', v_new, 'reason', coalesce(nullif(btrim(p_reason), ''),
      case when v_old is null then 'Registro inicial' else 'Corrección antes de emisión' end),
      'history_confirmed', p_confirm_history));
  return true;
end;
$$;

-- New catalog profiles and their initial identity are saved atomically.
create function public.create_speaker_with_document(p_profile jsonb, p_document_number text default '')
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  if not public.is_internal_user() then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  if jsonb_typeof(p_profile) is distinct from 'object'
    or length(btrim(coalesce(p_profile->>'first_names', ''))) < 2
    or length(btrim(coalesce(p_profile->>'last_names', ''))) < 2 then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;
  insert into public.speakers(first_names, last_names, is_active, bio, linkedin_url, organization,
    professional_title, specialties, website_url)
  values(btrim(p_profile->>'first_names'), btrim(p_profile->>'last_names'),
    coalesce((p_profile->>'is_active')::boolean, true), p_profile->>'bio', p_profile->>'linkedin_url',
    p_profile->>'organization', p_profile->>'professional_title',
    coalesce(array(select jsonb_array_elements_text(p_profile->'specialties')), '{}'::text[]), p_profile->>'website_url')
  returning id into v_id;
  perform public.set_speaker_document(v_id, p_document_number);
  return v_id;
end;
$$;

create function public.assert_speaker_document(p_speaker_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform 1 from public.speakers where id = p_speaker_id for update;
  if not exists(select 1 from public.speaker_identity_documents where speaker_id = p_speaker_id) then
    raise exception 'SPEAKER_DOCUMENT_REQUIRED' using errcode = 'P0001';
  end if;
end;
$$;

create function public.require_speaker_certificate_document()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.recipient_type = 'speaker' then
    if tg_op = 'INSERT' then
      perform public.assert_speaker_document(new.speaker_id);
    elsif old.file_path is null and new.file_path is not null then
      perform public.assert_speaker_document(new.speaker_id);
    end if;
  end if;
  return new;
end;
$$;
create trigger require_speaker_certificate_document before insert or update of file_path on public.certificates
for each row execute function public.require_speaker_certificate_document();

-- Keep existing signatures and snapshots. Guard old clients and pending recovery too.
do $$
declare v_definition text; v_anchor text;
begin
  select pg_get_functiondef('public.prepare_speaker_certificates(uuid,uuid,jsonb)'::regprocedure) into v_definition;
  v_anchor := 'select * into v_existing from public.certificates';
  if strpos(v_definition, v_anchor) = 0 then raise exception 'Incompatible preparation definition'; end if;
  v_definition := replace(v_definition, v_anchor, 'perform 1 from public.speakers where id = v_speaker.id for update;' || E'\n    ' || v_anchor);
  v_anchor := E'if found then\n      if v_existing.status';
  if strpos(v_definition, v_anchor) = 0 then raise exception 'Incompatible existing certificate definition'; end if;
  execute replace(v_definition, v_anchor, E'if found then\n      if v_existing.file_path is null then perform public.assert_speaker_document(v_speaker.id); end if;\n      if v_existing.status');
  select pg_get_functiondef('public.finalize_speaker_certificate(uuid,text,text,uuid)'::regprocedure) into v_definition;
  v_anchor := 'if p_lease_token is null or v_certificate.generation_lease_token';
  if strpos(v_definition, v_anchor) = 0 then raise exception 'Incompatible finalization definition'; end if;
  execute replace(v_definition, v_anchor, 'perform public.assert_speaker_document(v_certificate.speaker_id);' || E'\n  ' || v_anchor);
end;
$$;

create or replace function public.claim_speaker_certificate(p_certificate_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_token uuid := gen_random_uuid(); v_speaker_id uuid;
begin
  if not public.is_active_admin() then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  select speaker_id into v_speaker_id from public.certificates
    where id = p_certificate_id and recipient_type = 'speaker' and file_path is null and deleted_at is null;
  if not found then return null; end if;
  perform public.assert_speaker_document(v_speaker_id);
  update public.certificates set generation_lease_token = v_token, generation_lease_until = now() + interval '5 minutes'
  where id = p_certificate_id and recipient_type = 'speaker' and status = 'issued' and file_path is null and deleted_at is null
    and (generation_lease_until is null or generation_lease_until < now());
  if not found then return null; end if;
  return v_token;
end;
$$;

-- Internal-only identity join shared by public lookup and the authenticated Campus.
create function public.certificate_identity_ids(p_person_id uuid, p_dni text)
returns table(id uuid) language sql stable security definer set search_path = '' as $$
  select c.id from public.certificates c
  where c.deleted_at is null and public.is_activity_certificate_visible(c.id)
    and (c.person_id = p_person_id or (c.recipient_type = 'speaker' and c.file_path is not null
      and exists(select 1 from public.speaker_identity_documents d where d.speaker_id = c.speaker_id
        and d.document_number = p_dni)));
$$;

create or replace function public.get_my_certificates()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_person_id uuid := public.current_person_id(); v_dni text; v_result jsonb;
begin
  if v_person_id is null then raise exception 'ACCOUNT_NOT_LINKED' using errcode = '42501'; end if;
  select document_number into v_dni from public.people where id = v_person_id and document_type = 'dni';
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', c.id, 'access_token', c.access_token, 'certificate_code', c.certificate_code,
    'certificate_type', c.certificate_type, 'recipient_type', c.recipient_type,
    'participant_name', c.participant_name_snapshot, 'status', c.status, 'title', c.title_snapshot,
    'condition', c.condition_snapshot, 'academic_hours', c.academic_hours_snapshot,
    'issued_at', c.issued_at, 'file_ready', c.file_path is not null,
    'revocation_reason', c.revocation_reason, 'course_id', enrollment.course_id
  ) order by c.issued_at desc, c.id), '[]'::jsonb) into v_result
  from public.certificate_identity_ids(v_person_id, v_dni) matched
  join public.certificates c on c.id = matched.id
  left join public.course_enrollments enrollment on enrollment.id = c.course_enrollment_id;
  return v_result;
end;
$$;

-- Keep the course detail contract aligned with the shared Campus card schema.
create or replace function public.get_my_course_certificate(p_course_id uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'id', c.id, 'access_token', c.access_token, 'certificate_code', c.certificate_code,
    'certificate_type', c.certificate_type, 'recipient_type', c.recipient_type,
    'participant_name', c.participant_name_snapshot, 'status', c.status,
    'title', c.title_snapshot, 'condition', c.condition_snapshot, 'academic_hours', c.academic_hours_snapshot,
    'issued_at', c.issued_at, 'file_ready', c.file_path is not null,
    'revocation_reason', c.revocation_reason, 'course_id', enrollment.course_id
  ) from public.certificates c join public.course_enrollments enrollment on enrollment.id = c.course_enrollment_id
  where enrollment.course_id = p_course_id and enrollment.person_id = public.current_person_id()
    and enrollment.deleted_at is null and c.certificate_type = 'course' and c.deleted_at is null limit 1;
$$;

create or replace function public.search_public_certificates_by_dni(
  p_document_number text, p_ip_address inet default null, p_user_agent text default null, p_actor_user_id uuid default null
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_document_number text := btrim(left(coalesce(p_document_number, ''), 20));
  v_person_id uuid; v_name text; v_certificates jsonb := '[]'::jsonb;
  v_context jsonb; v_result_count integer := 0; v_outcome text;
begin
  if p_ip_address is not null then
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('certificate-search:' || pg_catalog.host(p_ip_address), 0));
  end if;
  if p_ip_address is not null and (select count(*) >= 60 from (
    select 1 from public.audit_logs where action = 'certificate.public_search' and ip_address = p_ip_address
      and created_at >= now() - interval '10 minutes' limit 60) recent_searches) then
    insert into public.audit_logs(actor_user_id, action, entity_type, new_data, ip_address, user_agent)
    values(p_actor_user_id, 'certificate.public_search.rate_limited', 'certificate_public_query',
      jsonb_build_object('document_number', v_document_number, 'outcome', 'rate_limited', 'result_count', 0), p_ip_address, left(p_user_agent, 500));
    return jsonb_build_object('status', 'rate_limited', 'participant_name', null, 'certificates', '[]'::jsonb, 'recommendation_context', null);
  end if;
  if v_document_number !~ '^[0-9]{8}$' then
    v_outcome := 'invalid';
  else
    select id into v_person_id from public.people where document_type = 'dni'
      and document_number = v_document_number and deleted_at is null limit 1;
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', c.id, 'access_token', c.access_token, 'academic_hours', c.academic_hours_snapshot,
      'certificate_code', c.certificate_code, 'certificate_type', c.certificate_type, 'recipient_type', c.recipient_type,
      'condition', c.condition_snapshot, 'date_text', c.date_text_snapshot,
      'download_available', c.status = 'issued' and c.file_path is not null, 'issued_at', c.issued_at,
      'participant_name', c.participant_name_snapshot, 'revocation_reason', c.revocation_reason,
      'status', c.status, 'title', c.title_snapshot
    ) order by c.issued_at desc, c.id), '[]'::jsonb), count(*)::integer into v_certificates, v_result_count
    from public.certificate_identity_ids(v_person_id, v_document_number) matched join public.certificates c on c.id = matched.id;
    select jsonb_build_object('source_activity_id', a.id, 'source_activity_type', a.type, 'source_category_id', a.category_id)
    into v_context from public.certificate_identity_ids(v_person_id, v_document_number) matched
    join public.certificates c on c.id = matched.id
    left join public.registrations r on r.id = c.registration_id
    join public.activities a on a.id = coalesce(c.activity_id, r.activity_id)
    where c.certificate_type = 'activity' order by c.issued_at desc, c.id limit 1;
    -- Use a document snapshot, never a private catalog profile name.
    v_name := v_certificates->0->>'participant_name';
    v_outcome := case when v_result_count > 0 then 'found' else 'not_found' end;
  end if;
  insert into public.audit_logs(actor_user_id, action, entity_type, entity_id, new_data, ip_address, user_agent)
  values(p_actor_user_id, 'certificate.public_search', 'certificate_public_query',
    case when v_result_count > 0 then v_person_id else null end,
    jsonb_build_object('document_number', v_document_number, 'outcome', v_outcome, 'result_count', v_result_count), p_ip_address, left(p_user_agent, 500));
  return jsonb_build_object('status', v_outcome, 'participant_name', v_name,
    'certificates', v_certificates, 'recommendation_context', v_context);
end;
$$;

-- Harden helper and mutation permissions independently from RLS.
revoke all on function public.get_speaker_document_context(uuid[]), public.set_speaker_document(uuid,text,text,text,boolean),
  public.create_speaker_with_document(jsonb,text) from public, anon;
grant execute on function public.get_speaker_document_context(uuid[]), public.set_speaker_document(uuid,text,text,text,boolean),
  public.create_speaker_with_document(jsonb,text) to authenticated, service_role;
revoke all on function public.assert_speaker_document(uuid), public.require_speaker_certificate_document(),
  public.certificate_identity_ids(uuid,text) from public, anon, authenticated, service_role;
revoke all on function public.search_public_certificates_by_dni(text,inet,text,uuid) from public, anon, authenticated;
grant execute on function public.search_public_certificates_by_dni(text,inet,text,uuid) to service_role;
revoke all on function public.get_my_certificates() from public, anon;
grant execute on function public.get_my_certificates() to authenticated, service_role;
