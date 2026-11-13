-- NULL audience preserves shared activity models; the certificate's origin never changes.
alter table public.certificate_templates
  add column audience public.certificate_recipient_type,
  add column legacy_snapshot jsonb,
  add constraint certificate_template_audience_check check (
    (scope = 'activity' and (audience is null or audience in ('participant', 'speaker')))
    or (scope = 'course' and audience is not distinct from 'student')
  ) not valid;
update public.certificate_templates set audience = 'student' where scope = 'course';
alter table public.certificate_templates validate constraint certificate_template_audience_check;
drop index public.uq_certificate_template_default_active;
create unique index uq_certificate_template_default_active on public.certificate_templates
  (scope, audience) nulls not distinct
  where is_default and is_active and deleted_at is null;

create function public.normalize_course_template_audience()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.scope = 'course' and new.audience is null then new.audience := 'student'; end if;
  return new;
end;
$$;
create trigger normalize_course_template_audience before insert on public.certificate_templates
for each row execute function public.normalize_course_template_audience();

create function public.snapshot_certificate_template(p_id uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  select (to_jsonb(t) - 'legacy_snapshot') || jsonb_build_object('signers', (
    select coalesce(jsonb_agg(to_jsonb(s) order by s.sort_order, s.id), '[]'::jsonb)
    from public.certificate_template_signers s where s.template_id = t.id and s.deleted_at is null
  )) from public.certificate_templates t where t.id = p_id;
$$;

-- Historical rows (including archived activities) are untouched. Their reference
-- is the design available at migration, not a reconstruction of the original.
update public.certificate_templates t set legacy_snapshot =
  public.snapshot_certificate_template(t.id) || '{"snapshot_origin":"migration_reference"}'::jsonb;

create function public.capture_certificate_design()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_template public.certificate_templates%rowtype;
  v_audience public.certificate_recipient_type;
begin
  if tg_op = 'UPDATE' then
    if old.template_snapshot is distinct from new.template_snapshot or old.template_id is distinct from new.template_id
    then raise exception 'CERTIFICATE_DESIGN_IMMUTABLE' using errcode = '22023'; end if;
    return new;
  end if;
  v_audience := case when new.certificate_type = 'course' then 'student'
    when new.recipient_type = 'speaker' then 'speaker' else 'participant' end;
  select * into v_template from public.certificate_templates where id = new.template_id for share;
  if not found or not v_template.is_active or v_template.deleted_at is not null
    or v_template.scope <> new.certificate_type
    or (v_template.audience is not null and v_template.audience <> v_audience)
  then raise exception 'TEMPLATE_NOT_AVAILABLE' using errcode = 'P0001'; end if;
  new.template_snapshot := public.snapshot_certificate_template(new.template_id);
  if jsonb_array_length(new.template_snapshot->'signers') = 4
    and not (new.template_snapshot->'template_config' ? 'layout_version')
  then
    new.template_snapshot := jsonb_set(new.template_snapshot, '{template_config,layout_version}', '2');
  end if;
  return new;
end;
$$;
create trigger capture_certificate_design before insert or update of template_id, template_snapshot on public.certificates
for each row execute function public.capture_certificate_design();

create function public.guard_certificate_batch_design()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform 1 from public.certificate_templates where id = new.template_id and scope = 'activity'
    and (audience is null or audience = 'participant') and is_active and deleted_at is null for share;
  if not found then raise exception 'TEMPLATE_NOT_AVAILABLE' using errcode = 'P0001'; end if;
  return new;
end;
$$;
create trigger guard_certificate_batch_design before insert on public.certificate_issue_batches
for each row execute function public.guard_certificate_batch_design();

create function public.guard_active_certificate_template()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if (old.name, old.scope, old.audience, old.background_path, old.template_config, old.is_active, old.deleted_at)
     is distinct from
     (new.name, new.scope, new.audience, new.background_path, new.template_config, new.is_active, new.deleted_at)
    and exists (select 1 from public.certificate_issue_batches b join public.certificate_issue_batch_items i
      on i.batch_id = b.id where b.template_id = old.id and i.state in ('pending', 'processing', 'failed'))
  then raise exception 'TEMPLATE_BATCH_ACTIVE' using errcode = 'P0001'; end if;
  return new;
end;
$$;
create trigger guard_active_certificate_template before update on public.certificate_templates
for each row execute function public.guard_active_certificate_template();

-- Filter before preparing. The insert trigger independently protects direct writes.
do $$
declare v_definition text; v_signature text; v_anchor text;
begin
  for v_signature, v_anchor in select * from (values
    ('public.prepare_activity_certificates(uuid[],uuid,text)', 'where id = p_template_id and scope = ''activity'' and is_active and deleted_at is null'),
    ('public.prepare_speaker_certificates(uuid,uuid,jsonb)', 'where id = p_template_id and scope = ''activity'' and is_active and deleted_at is null')
  ) rules(signature, anchor) loop
    select pg_get_functiondef(v_signature::regprocedure) into v_definition;
    if strpos(v_definition, v_anchor) = 0 then raise exception 'Incompatible template validation: %', v_signature; end if;
    execute replace(v_definition, v_anchor, v_anchor || case when v_signature like '%speaker%' then
      ' and (audience is null or audience = ''speaker'')' else ' and (audience is null or audience = ''participant'')' end);
  end loop;
end;
$$;

create or replace function public.save_certificate_template(p_template jsonb, p_signers jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid := coalesce(nullif(p_template->>'id', '')::uuid, gen_random_uuid());
  v_old public.certificate_templates%rowtype;
  v_name text := btrim(p_template->>'name');
  v_scope public.certificate_type := coalesce((p_template->>'scope')::public.certificate_type, 'activity');
  v_audience public.certificate_recipient_type;
  v_config jsonb := coalesce(p_template->'template_config', '{}'::jsonb);
  v_active boolean := coalesce((p_template->>'is_active')::boolean, true);
  v_default boolean := coalesce((p_template->>'is_default')::boolean, false);
  v_background text := nullif(btrim(p_template->>'background_path'), '');
  v_signer jsonb;
  v_order integer := 0;
  v_signature text;
  v_previous uuid;
  v_seen uuid[] := '{}';
  v_recognition text := coalesce(v_config->>'recognition', '');
  v_old_snapshot jsonb;
begin
  if not public.is_administrator() then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  if coalesce(length(v_name),0) not between 3 and 150 or jsonb_typeof(v_config) is distinct from 'object'
    or jsonb_typeof(p_signers) is distinct from 'array'
  then raise exception 'VALIDATION_ERROR' using errcode = '22023'; end if;
  if jsonb_array_length(p_signers) not between 1 and 4 or length(coalesce(v_config->>'heading', '')) > 180
    or length(v_recognition) > 600
    or (btrim(v_recognition) <> '' and (strpos(v_recognition, '{{condicion}}') = 0
      or replace(replace(v_recognition, '{{condicion}}', ''), '{{titulo}}', '') ~ '[{}]'))
  then raise exception 'VALIDATION_ERROR' using errcode = '22023'; end if;

  -- Serialize default switches and use the same row lock as batch creation.
  perform pg_advisory_xact_lock(31020, 1);
  select * into v_old from public.certificate_templates where id = v_id for update;
  if v_old.deleted_at is not null or (p_template ? 'expected_updated_at'
    and v_old.updated_at is distinct from (p_template->>'expected_updated_at')::timestamptz)
  then raise exception 'TEMPLATE_CHANGED' using errcode = '40001'; end if;
  v_audience := case when p_template ? 'audience' then (p_template->>'audience')::public.certificate_recipient_type
    when v_old.id is not null then v_old.audience
    when v_scope = 'course' then 'student' else 'participant' end;
  if (v_old.id is null and v_audience is null)
    or (v_old.id is not null and (v_scope, v_audience) is distinct from (v_old.scope, v_old.audience))
  then raise exception 'VALIDATION_ERROR' using errcode = '22023'; end if;
  if exists (select 1 from public.certificate_issue_batches b join public.certificate_issue_batch_items i
    on i.batch_id = b.id where b.template_id = v_id and i.state in ('pending', 'processing', 'failed'))
  then raise exception 'TEMPLATE_BATCH_ACTIVE' using errcode = 'P0001'; end if;
  v_old_snapshot := public.snapshot_certificate_template(v_id);
  if v_background is not null and v_background is distinct from v_old.background_path and (
    v_background not like 'templates/' || v_id::text || '/background/%'
    or not exists(select 1 from storage.objects where bucket_id = 'certificates' and name = v_background))
  then raise exception 'VALIDATION_ERROR' using errcode = '22023'; end if;

  insert into public.certificate_templates(id,name,scope,audience,background_path,template_config,is_active,is_default)
  values(v_id,v_name,v_scope,v_audience,v_background,v_config || '{"layout_version":2}',v_active,false)
  on conflict(id) do update set name=excluded.name, background_path=excluded.background_path,
    template_config=excluded.template_config, is_active=excluded.is_active, is_default=false;
  for v_signer in select value from jsonb_array_elements(p_signers) loop
    v_signature := nullif(btrim(v_signer->>'signature_path'), '');
    v_previous := nullif(v_signer->>'id', '')::uuid;
    -- The pre-migration editor identifies saved signers by position.
    if v_previous is null and v_old.id is not null and not (p_template ? 'expected_updated_at') then
      select s.id into v_previous from public.certificate_template_signers s
      where s.template_id=v_id and s.deleted_at is null
        and s.sort_order=coalesce((v_signer->>'sort_order')::integer,v_order)
      order by s.id limit 1;
    end if;
    if coalesce(length(btrim(v_signer->>'signer_name')),0) not between 3 and 200
      or length(coalesce(v_signer->>'signer_title','')) > 200
      or (v_previous is not null and (v_previous = any(v_seen) or not exists (
        select 1 from public.certificate_template_signers where id=v_previous and template_id=v_id and deleted_at is null)))
    then raise exception 'VALIDATION_ERROR' using errcode = '22023'; end if;
    if v_signature is null and not exists (select 1 from public.certificate_template_signers
      where id=v_previous and template_id=v_id and deleted_at is null and signature_path is null)
    then raise exception 'SIGNATURE_REQUIRED' using errcode = '22023'; end if;
    if v_signature is not null and not exists(select 1 from public.certificate_template_signers
      where id=v_previous and template_id=v_id and deleted_at is null and signature_path=v_signature)
      and (v_signature not like 'templates/' || v_id::text || '/signature/%'
        or not exists(select 1 from storage.objects where bucket_id='certificates' and name=v_signature))
    then raise exception 'VALIDATION_ERROR' using errcode = '22023'; end if;
    v_previous := coalesce(v_previous, gen_random_uuid());
    insert into public.certificate_template_signers(id,template_id,signer_name,signer_title,signature_path,sort_order)
    values(v_previous,v_id,btrim(v_signer->>'signer_name'),nullif(btrim(v_signer->>'signer_title'),''),v_signature,v_order)
    on conflict(id) do update set signer_name=excluded.signer_name,signer_title=excluded.signer_title,
      signature_path=excluded.signature_path,sort_order=excluded.sort_order;
    v_seen := array_append(v_seen,v_previous);
    v_order := v_order + 1;
  end loop;
  update public.certificate_template_signers set deleted_at=now(),deleted_by=auth.uid()
    where template_id=v_id and deleted_at is null and not(id=any(v_seen));
  if v_default and v_active then
    update public.certificate_templates set is_default=false where scope=v_scope and audience is not distinct from v_audience
      and id<>v_id and is_default and deleted_at is null;
    update public.certificate_templates set is_default=true where id=v_id;
  end if;
  insert into public.audit_logs(actor_user_id,action,entity_type,entity_id,old_data,new_data)
  values(auth.uid(),case when v_old.id is null then 'certificate_template.created' else 'certificate_template.updated' end,
    'certificate_template',v_id,v_old_snapshot,public.snapshot_certificate_template(v_id));
  return v_id;
end;
$$;

-- The legacy editor still uses the former retirement rule until the frontend
-- with snapshot-aware regeneration is deployed.
do $$
declare v_definition text;
begin
  select pg_get_functiondef('public.soft_delete_certificate_template(uuid)'::regprocedure) into v_definition;
  if strpos(v_definition,'public.is_active_admin()')=0 then raise exception 'Incompatible template retirement guard'; end if;
  execute replace(v_definition,'public.is_active_admin()','public.is_administrator()');
end;
$$;

create function public.retire_certificate_template(p_template_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_old public.certificate_templates%rowtype;
begin
  if not public.is_administrator() then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  select * into v_old from public.certificate_templates
  where id = p_template_id and deleted_at is null for update;
  if not found then raise exception 'TEMPLATE_NOT_FOUND' using errcode = 'P0001'; end if;
  update public.certificate_templates set deleted_at = now(), deleted_by = auth.uid(), is_default = false, is_active = false
  where id = p_template_id;
  update public.certificate_template_signers set deleted_at = now(), deleted_by = auth.uid()
  where template_id = p_template_id and deleted_at is null;
  insert into public.audit_logs(actor_user_id,action,entity_type,entity_id,old_data)
  values(auth.uid(),'certificate_template.deleted','certificate_template',p_template_id,to_jsonb(v_old) - 'legacy_snapshot');
  return p_template_id;
end;
$$;
revoke execute on function public.retire_certificate_template(uuid) from public, anon;
grant execute on function public.retire_certificate_template(uuid) to authenticated, service_role;

-- Template images are append-only; staged images can be discarded and issued PDFs
-- retain their existing operational upload and cleanup permissions.
drop policy certificates_storage_admin_insert on storage.objects;
drop policy certificates_storage_admin_update on storage.objects;
drop policy certificates_storage_admin_delete on storage.objects;
create policy certificates_storage_internal_insert on storage.objects for insert to authenticated
with check (bucket_id='certificates' and (
  (name like 'issued/%' and (select public.is_internal_user())) or
  ((name like 'staging/%' or name like 'templates/%') and (select public.is_administrator()))
));
create policy certificates_storage_internal_update on storage.objects for update to authenticated
using (bucket_id='certificates' and (
  (name like 'issued/%' and (select public.is_internal_user())) or
  (name like 'staging/%' and (select public.is_administrator()))
))
with check (bucket_id='certificates' and (
  (name like 'issued/%' and (select public.is_internal_user())) or
  (name like 'templates/%' and (select public.is_administrator()))
));
create policy certificates_storage_internal_delete on storage.objects for delete to authenticated
using (bucket_id='certificates' and (
  (name like 'issued/%' and (select public.is_internal_user())) or
  (name like 'staging/%' and (select public.is_administrator()))
));
revoke all on function public.snapshot_certificate_template(uuid), public.capture_certificate_design(),
  public.guard_certificate_batch_design(), public.guard_active_certificate_template(), public.normalize_course_template_audience()
from public, anon, authenticated, service_role;
