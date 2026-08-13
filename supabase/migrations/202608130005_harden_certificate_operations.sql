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
      v_name, v_scope, v_background_path, v_template_config, false, v_is_active
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
      is_default = false,
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
  update public.certificate_templates
  set is_default = v_is_default and v_is_active
  where id = v_id;

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

revoke execute on function public.get_public_certificate_file(text) from anon, authenticated;
grant execute on function public.get_public_certificate_file(text) to service_role;

comment on function public.get_public_certificate_file(text) is
  'Resuelve una ruta privada únicamente para el backend con service_role.';
