create type public.certificate_type as enum ('activity', 'course');
create type public.certificate_status as enum ('issued', 'revoked');

create sequence public.certificate_code_seq start with 1;

create table public.certificate_templates (
  id uuid primary key default gen_random_uuid(),
  name varchar(150) not null,
  scope public.certificate_type not null,
  background_path text,
  template_config jsonb not null default '{}'::jsonb,
  is_default boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  constraint certificate_templates_name_not_blank check (length(btrim(name)) > 0),
  constraint certificate_templates_config_object check (jsonb_typeof(template_config) = 'object'),
  constraint certificate_templates_deleted_by_consistency check (deleted_at is not null or deleted_by is null)
);

create table public.certificate_template_signers (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.certificate_templates(id) on delete cascade,
  signer_name varchar(200) not null,
  signer_title text,
  signature_path text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  constraint certificate_signers_name_not_blank check (length(btrim(signer_name)) > 0),
  constraint certificate_signers_sort_nonnegative check (sort_order >= 0),
  constraint certificate_signers_deleted_by_consistency check (deleted_at is not null or deleted_by is null)
);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people(id) on delete restrict,
  template_id uuid not null references public.certificate_templates(id) on delete restrict,
  registration_id uuid references public.registrations(id) on delete restrict,
  course_enrollment_id uuid,
  certificate_type public.certificate_type not null,
  certificate_code varchar(50) not null unique,
  status public.certificate_status not null default 'issued',
  participant_name_snapshot text not null,
  title_snapshot text not null,
  condition_snapshot text,
  date_text_snapshot text,
  academic_hours_snapshot numeric(6, 2),
  file_path text,
  access_token uuid not null default gen_random_uuid() unique,
  issued_at timestamptz not null default now(),
  issued_by uuid references auth.users(id) on delete set null,
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id) on delete set null,
  revocation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  constraint certificates_origin_exactly_one check (
    (registration_id is not null and course_enrollment_id is null)
    or (registration_id is null and course_enrollment_id is not null)
  ),
  constraint certificates_origin_matches_type check (
    (certificate_type = 'activity' and registration_id is not null)
    or (certificate_type = 'course' and course_enrollment_id is not null)
  ),
  constraint certificates_participant_not_blank check (length(btrim(participant_name_snapshot)) > 0),
  constraint certificates_title_not_blank check (length(btrim(title_snapshot)) > 0),
  constraint certificates_hours_nonnegative check (academic_hours_snapshot is null or academic_hours_snapshot >= 0),
  constraint certificates_revocation_consistency check (
    (status = 'issued' and revoked_at is null and revoked_by is null)
    or (status = 'revoked' and revoked_at is not null)
  ),
  constraint certificates_deleted_by_consistency check (deleted_at is not null or deleted_by is null)
);

create unique index uq_certificate_template_default_active
on public.certificate_templates(scope)
where is_default and is_active and deleted_at is null;

create index idx_certificate_signers_template
on public.certificate_template_signers(template_id, sort_order)
where deleted_at is null;

create index idx_certificates_person
on public.certificates(person_id)
where deleted_at is null;

create index idx_certificates_code
on public.certificates(certificate_code);

create unique index uq_certificates_registration_active
on public.certificates(registration_id)
where certificate_type = 'activity' and deleted_at is null;

create index idx_certificates_status
on public.certificates(status, issued_at desc)
where deleted_at is null;

create trigger set_certificate_templates_updated_at
before update on public.certificate_templates
for each row execute function public.set_updated_at();

create trigger set_certificate_signers_updated_at
before update on public.certificate_template_signers
for each row execute function public.set_updated_at();

create trigger set_certificates_updated_at
before update on public.certificates
for each row execute function public.set_updated_at();

alter table public.certificate_templates enable row level security;
alter table public.certificate_template_signers enable row level security;
alter table public.certificates enable row level security;

revoke all on table public.certificate_templates from anon, authenticated;
revoke all on table public.certificate_template_signers from anon, authenticated;
revoke all on table public.certificates from anon, authenticated;

grant select on table public.certificate_templates to authenticated;
grant select on table public.certificate_template_signers to authenticated;
grant select on table public.certificates to authenticated;
grant all on table public.certificate_templates to service_role;
grant all on table public.certificate_template_signers to service_role;
grant all on table public.certificates to service_role;
grant usage, select on sequence public.certificate_code_seq to service_role;

create policy certificate_templates_admin_read
on public.certificate_templates for select to authenticated
using ((select public.is_active_admin()));

create policy certificate_signers_admin_read
on public.certificate_template_signers for select to authenticated
using ((select public.is_active_admin()));

create policy certificates_admin_read
on public.certificates for select to authenticated
using ((select public.is_active_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'certificates',
  'certificates',
  false,
  10485760,
  array['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy certificates_storage_admin_read
on storage.objects for select to authenticated
using (bucket_id = 'certificates' and (select public.is_active_admin()));

create policy certificates_storage_admin_insert
on storage.objects for insert to authenticated
with check (bucket_id = 'certificates' and (select public.is_active_admin()));

create policy certificates_storage_admin_update
on storage.objects for update to authenticated
using (bucket_id = 'certificates' and (select public.is_active_admin()))
with check (bucket_id = 'certificates' and (select public.is_active_admin()));

create policy certificates_storage_admin_delete
on storage.objects for delete to authenticated
using (bucket_id = 'certificates' and (select public.is_active_admin()));

insert into public.certificate_templates (
  id, name, scope, template_config, is_default, is_active
) values (
  'c5000000-0000-4000-8000-000000000001',
  'Modelo institucional CCI',
  'activity',
  '{"bundled_background":"cci-activity-certificate-background.png","show_date":true,"portrait":true}'::jsonb,
  true,
  true
);

insert into public.certificate_template_signers (
  id, template_id, signer_name, signer_title, sort_order
) values (
  'c5100000-0000-4000-8000-000000000001',
  'c5000000-0000-4000-8000-000000000001',
  'Eduardo Ojeda Davila',
  'Presidente Institucional',
  0
);

create or replace function public.save_certificate_template(
  p_template jsonb,
  p_signers jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_background_path text := nullif(btrim(p_template->>'background_path'), '');
  v_id uuid := nullif(p_template->>'id', '')::uuid;
  v_is_active boolean := coalesce((p_template->>'is_active')::boolean, true);
  v_is_default boolean := coalesce((p_template->>'is_default')::boolean, false);
  v_name text := btrim(p_template->>'name');
  v_old jsonb;
  v_scope public.certificate_type := coalesce((p_template->>'scope')::public.certificate_type, 'activity');
  v_signer jsonb;
  v_template_config jsonb := coalesce(p_template->'template_config', '{}'::jsonb);
begin
  if not public.is_active_admin() then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;
  if v_name is null or length(v_name) < 3 or length(v_name) > 150
    or jsonb_typeof(v_template_config) <> 'object'
    or jsonb_typeof(p_signers) <> 'array'
    or jsonb_array_length(p_signers) = 0
    or jsonb_array_length(p_signers) > 4
  then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  if v_id is null then
    insert into public.certificate_templates (
      name, scope, background_path, template_config, is_default, is_active
    ) values (
      v_name, v_scope, v_background_path, v_template_config, v_is_default, v_is_active
    ) returning id into v_id;
  else
    select to_jsonb(certificate_templates.*) into v_old
    from public.certificate_templates
    where id = v_id and deleted_at is null
    for update;
    if not found then raise exception 'TEMPLATE_NOT_FOUND' using errcode = 'P0001'; end if;

    update public.certificate_templates set
      name = v_name,
      scope = v_scope,
      background_path = v_background_path,
      template_config = v_template_config,
      is_default = v_is_default,
      is_active = v_is_active
    where id = v_id;

    update public.certificate_template_signers set
      deleted_at = now(), deleted_by = auth.uid()
    where template_id = v_id and deleted_at is null;
  end if;

  if v_is_default and v_is_active then
    update public.certificate_templates set is_default = false
    where scope = v_scope and id <> v_id and is_default and deleted_at is null;
  end if;

  for v_signer in select value from jsonb_array_elements(p_signers)
  loop
    if length(btrim(v_signer->>'signer_name')) < 3
      or length(btrim(v_signer->>'signer_name')) > 200
    then raise exception 'VALIDATION_ERROR' using errcode = '22023'; end if;

    insert into public.certificate_template_signers (
      template_id, signer_name, signer_title, signature_path, sort_order
    ) values (
      v_id,
      btrim(v_signer->>'signer_name'),
      nullif(btrim(v_signer->>'signer_title'), ''),
      nullif(btrim(v_signer->>'signature_path'), ''),
      coalesce((v_signer->>'sort_order')::integer, 0)
    );
  end loop;

  insert into public.audit_logs (
    actor_user_id, action, entity_type, entity_id, old_data, new_data
  ) values (
    auth.uid(),
    case when v_old is null then 'certificate_template.created' else 'certificate_template.updated' end,
    'certificate_template',
    v_id,
    v_old,
    (select to_jsonb(certificate_templates.*) from public.certificate_templates where id = v_id)
  );
  return v_id;
end;
$$;

create or replace function public.soft_delete_certificate_template(p_template_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare v_old public.certificate_templates%rowtype;
begin
  if not public.is_active_admin() then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  select * into v_old from public.certificate_templates
  where id = p_template_id and deleted_at is null for update;
  if not found then raise exception 'TEMPLATE_NOT_FOUND' using errcode = 'P0001'; end if;
  if exists (select 1 from public.certificates where template_id = p_template_id and deleted_at is null) then
    raise exception 'TEMPLATE_IN_USE' using errcode = 'P0001';
  end if;
  update public.certificate_templates set deleted_at = now(), deleted_by = auth.uid(), is_default = false, is_active = false
  where id = p_template_id;
  update public.certificate_template_signers set deleted_at = now(), deleted_by = auth.uid()
  where template_id = p_template_id and deleted_at is null;
  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, old_data)
  values (auth.uid(), 'certificate_template.deleted', 'certificate_template', p_template_id, to_jsonb(v_old));
  return p_template_id;
end;
$$;

create or replace function public.prepare_activity_certificates(
  p_registration_ids uuid[],
  p_template_id uuid,
  p_condition text default 'Participó'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_certificate public.certificates%rowtype;
  v_existing public.certificates%rowtype;
  v_prepared jsonb := '[]'::jsonb;
  v_existing_items jsonb := '[]'::jsonb;
  v_rejected jsonb := '[]'::jsonb;
  v_registration record;
  v_condition text := nullif(btrim(p_condition), '');
  v_expected integer := cardinality(p_registration_ids);
begin
  if not public.is_active_admin() then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  if v_expected is null or v_expected = 0 or v_expected > 100 or v_condition is null or length(v_condition) > 120 then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.certificate_templates
    where id = p_template_id and scope = 'activity' and is_active and deleted_at is null
  ) then raise exception 'TEMPLATE_NOT_AVAILABLE' using errcode = 'P0001'; end if;

  for v_registration in
    select
      registrations.id,
      registrations.person_id,
      registrations.status,
      attendance.status as attendance_status,
      people.first_names,
      people.last_names,
      activities.title,
      activities.academic_hours,
      (
        select case
          when count(*) = 0 then null
          when min(activity_dates.starts_at)::date = max(activity_dates.starts_at)::date
            then to_char(min(activity_dates.starts_at) at time zone 'America/Lima', 'DD/MM/YYYY')
          else concat(
            to_char(min(activity_dates.starts_at) at time zone 'America/Lima', 'DD/MM/YYYY'),
            ' - ',
            to_char(max(activity_dates.starts_at) at time zone 'America/Lima', 'DD/MM/YYYY')
          )
        end
        from public.activity_dates
        where activity_dates.activity_id = activities.id and activity_dates.deleted_at is null
      ) as date_text
    from public.registrations
    join public.people on people.id = registrations.person_id and people.deleted_at is null
    join public.activities on activities.id = registrations.activity_id and activities.deleted_at is null
    join public.attendance on attendance.registration_id = registrations.id and attendance.deleted_at is null
    where registrations.id = any(p_registration_ids) and registrations.deleted_at is null
    order by registrations.id
    for update of registrations
  loop
    if v_registration.status <> 'confirmed' or v_registration.attendance_status <> 'attended' then
      v_rejected := v_rejected || jsonb_build_array(jsonb_build_object(
        'registration_id', v_registration.id,
        'reason', case when v_registration.status <> 'confirmed' then 'REGISTRATION_NOT_CONFIRMED' else 'ATTENDANCE_NOT_ATTENDED' end
      ));
      continue;
    end if;

    select * into v_existing from public.certificates
    where registration_id = v_registration.id and certificate_type = 'activity' and deleted_at is null;
    if found then
      v_existing_items := v_existing_items || jsonb_build_array(jsonb_build_object(
        'certificate_id', v_existing.id,
        'registration_id', v_registration.id,
        'file_ready', v_existing.file_path is not null
      ));
      continue;
    end if;

    insert into public.certificates (
      person_id, template_id, registration_id, certificate_type, certificate_code,
      participant_name_snapshot, title_snapshot, condition_snapshot,
      date_text_snapshot, academic_hours_snapshot, issued_by
    ) values (
      v_registration.person_id,
      p_template_id,
      v_registration.id,
      'activity',
      concat('CCI-CERT-', extract(year from now())::integer, '-', lpad(nextval('public.certificate_code_seq'::regclass)::text, 6, '0')),
      concat_ws(' ', v_registration.first_names, v_registration.last_names),
      v_registration.title,
      v_condition,
      v_registration.date_text,
      v_registration.academic_hours,
      auth.uid()
    ) returning * into v_certificate;

    v_prepared := v_prepared || jsonb_build_array(jsonb_build_object(
      'certificate_id', v_certificate.id,
      'registration_id', v_registration.id
    ));
  end loop;

  return jsonb_build_object('prepared', v_prepared, 'existing', v_existing_items, 'rejected', v_rejected);
end;
$$;

create or replace function public.finalize_activity_certificate(
  p_certificate_id uuid,
  p_file_path text,
  p_public_base_url text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_certificate public.certificates%rowtype;
  v_email text;
begin
  if not public.is_active_admin() then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  if length(btrim(p_file_path)) < 5 or length(btrim(p_public_base_url)) < 8 then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;
  select * into v_certificate from public.certificates
  where id = p_certificate_id and certificate_type = 'activity' and deleted_at is null for update;
  if not found then raise exception 'CERTIFICATE_NOT_FOUND' using errcode = 'P0001'; end if;
  if v_certificate.status = 'revoked' then raise exception 'CERTIFICATE_REVOKED' using errcode = 'P0001'; end if;
  if v_certificate.file_path is not null then
    return jsonb_build_object('changed', false, 'certificate_id', v_certificate.id);
  end if;

  update public.certificates set file_path = btrim(p_file_path)
  where id = v_certificate.id returning * into v_certificate;
  select email into strict v_email from public.people where id = v_certificate.person_id;

  insert into public.notification_outbox (
    person_id, event_type, recipient_email, related_entity_type, related_entity_id, payload
  ) values (
    v_certificate.person_id,
    'activity_certificate_issued',
    v_email,
    'certificate',
    v_certificate.id,
    jsonb_build_object(
      'certificate_code', v_certificate.certificate_code,
      'certificate_url', concat(rtrim(p_public_base_url, '/'), '/certificados/', v_certificate.access_token),
      'participant_name', v_certificate.participant_name_snapshot,
      'activity_title', v_certificate.title_snapshot,
      'condition', v_certificate.condition_snapshot
    )
  ) on conflict (event_type, related_entity_type, related_entity_id)
    where deleted_at is null and related_entity_id is not null do nothing;

  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, new_data)
  values (auth.uid(), 'certificate.issued', 'certificate', v_certificate.id, to_jsonb(v_certificate));
  return jsonb_build_object('changed', true, 'certificate_id', v_certificate.id);
end;
$$;

create or replace function public.abandon_unfinalized_certificate(p_certificate_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_active_admin() then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  update public.certificates set deleted_at = now(), deleted_by = auth.uid()
  where id = p_certificate_id and file_path is null and deleted_at is null;
  return found;
end;
$$;

create or replace function public.revoke_certificate(p_certificate_id uuid, p_reason text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_certificate public.certificates%rowtype;
  v_old public.certificates%rowtype;
  v_reason text := nullif(btrim(p_reason), '');
begin
  if not public.is_active_admin() then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  if v_reason is null or length(v_reason) > 500 then raise exception 'VALIDATION_ERROR' using errcode = '22023'; end if;
  select * into v_old from public.certificates where id = p_certificate_id and deleted_at is null for update;
  if not found then raise exception 'CERTIFICATE_NOT_FOUND' using errcode = 'P0001'; end if;
  if v_old.status = 'revoked' then return jsonb_build_object('changed', false, 'certificate_id', v_old.id); end if;
  update public.certificates set status = 'revoked', revoked_at = now(), revoked_by = auth.uid(), revocation_reason = v_reason
  where id = v_old.id returning * into v_certificate;
  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, old_data, new_data)
  values (auth.uid(), 'certificate.revoked', 'certificate', v_certificate.id, to_jsonb(v_old), to_jsonb(v_certificate));
  return jsonb_build_object('changed', true, 'certificate_id', v_certificate.id);
end;
$$;

create or replace function public.get_public_certificate(p_access_token text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'certificate_code', certificates.certificate_code,
    'status', certificates.status,
    'participant_name', certificates.participant_name_snapshot,
    'title', certificates.title_snapshot,
    'condition', certificates.condition_snapshot,
    'date_text', certificates.date_text_snapshot,
    'academic_hours', certificates.academic_hours_snapshot,
    'issued_at', certificates.issued_at,
    'revoked_at', certificates.revoked_at,
    'revocation_reason', certificates.revocation_reason,
    'download_available', certificates.status = 'issued' and certificates.file_path is not null
  )
  from public.certificates
  where certificates.access_token::text = lower(btrim(p_access_token))
    and certificates.deleted_at is null
  limit 1;
$$;

create or replace function public.get_public_certificate_file(p_access_token text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select file_path from public.certificates
  where access_token::text = lower(btrim(p_access_token))
    and status = 'issued' and file_path is not null and deleted_at is null
  limit 1;
$$;

create or replace function public.retry_notification(p_notification_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_active_admin() then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  update public.notification_outbox set status = 'pending', attempts = 0, next_attempt_at = null, last_error = null
  where id = p_notification_id and status = 'failed' and deleted_at is null;
  if not found then raise exception 'NOTIFICATION_NOT_RETRYABLE' using errcode = 'P0001'; end if;
  return p_notification_id;
end;
$$;

create or replace function public.claim_notification_batch(p_limit integer default 20)
returns setof public.notification_outbox
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_limit < 1 or p_limit > 100 then raise exception 'VALIDATION_ERROR' using errcode = '22023'; end if;
  return query
  with claimable as (
    select id from public.notification_outbox
    where status in ('pending', 'failed')
      and attempts < 5
      and (next_attempt_at is null or next_attempt_at <= now())
      and deleted_at is null
    order by created_at
    for update skip locked
    limit p_limit
  )
  update public.notification_outbox as notifications set
    status = 'processing', attempts = notifications.attempts + 1, last_error = null
  from claimable where notifications.id = claimable.id
  returning notifications.*;
end;
$$;

create or replace function public.complete_notification_delivery(
  p_notification_id uuid,
  p_success boolean,
  p_error text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare v_attempts integer;
begin
  select attempts into v_attempts from public.notification_outbox
  where id = p_notification_id and status = 'processing' and deleted_at is null for update;
  if not found then raise exception 'NOTIFICATION_NOT_PROCESSING' using errcode = 'P0001'; end if;
  update public.notification_outbox set
    status = case when p_success then 'sent'::public.notification_status else 'failed'::public.notification_status end,
    sent_at = case when p_success then now() else null end,
    last_error = case when p_success then null else left(coalesce(p_error, 'Error no especificado'), 2000) end,
    next_attempt_at = case when p_success or v_attempts >= 5 then null else now() + make_interval(mins => power(2, least(v_attempts, 6))::integer) end
  where id = p_notification_id;
  return p_notification_id;
end;
$$;

revoke execute on function public.save_certificate_template(jsonb, jsonb) from public, anon;
revoke execute on function public.soft_delete_certificate_template(uuid) from public, anon;
revoke execute on function public.prepare_activity_certificates(uuid[], uuid, text) from public, anon;
revoke execute on function public.finalize_activity_certificate(uuid, text, text) from public, anon;
revoke execute on function public.abandon_unfinalized_certificate(uuid) from public, anon;
revoke execute on function public.revoke_certificate(uuid, text) from public, anon;
revoke execute on function public.get_public_certificate(text) from public;
revoke execute on function public.get_public_certificate_file(text) from public;
revoke execute on function public.retry_notification(uuid) from public, anon;
revoke execute on function public.claim_notification_batch(integer) from public, anon, authenticated;
revoke execute on function public.complete_notification_delivery(uuid, boolean, text) from public, anon, authenticated;

grant execute on function public.save_certificate_template(jsonb, jsonb) to authenticated, service_role;
grant execute on function public.soft_delete_certificate_template(uuid) to authenticated, service_role;
grant execute on function public.prepare_activity_certificates(uuid[], uuid, text) to authenticated, service_role;
grant execute on function public.finalize_activity_certificate(uuid, text, text) to authenticated, service_role;
grant execute on function public.abandon_unfinalized_certificate(uuid) to authenticated, service_role;
grant execute on function public.revoke_certificate(uuid, text) to authenticated, service_role;
grant execute on function public.get_public_certificate(text) to anon, authenticated, service_role;
grant execute on function public.get_public_certificate_file(text) to anon, authenticated, service_role;
grant execute on function public.retry_notification(uuid) to authenticated, service_role;
grant execute on function public.claim_notification_batch(integer) to service_role;
grant execute on function public.complete_notification_delivery(uuid, boolean, text) to service_role;

comment on column public.certificates.date_text_snapshot is 'Texto opcional; se omite en certificados de cursos virtuales sin fechas gestionables.';
comment on table public.certificates is 'Certificados históricos de actividades y, desde el Hito 10, cursos.';
comment on function public.claim_notification_batch(integer) is 'Reclama notificaciones atómicamente para el procesador webhook de n8n.';
