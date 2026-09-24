-- A correction changes requested billing data only; it never changes the member-company snapshot.
create or replace function public.correct_member_group_billing(
  p_request_id uuid,
  p_billing jsonb,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_before public.member_group_requests%rowtype;
  v_type text := nullif(btrim(p_billing->>'type'), '');
  v_document text := nullif(btrim(p_billing->>'document'), '');
  v_name text := nullif(btrim(p_billing->>'name'), '');
  v_address text := nullif(btrim(p_billing->>'address'), '');
begin
  if not public.is_internal_user() then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;
  if p_request_id is null or p_billing is null
    or length(btrim(coalesce(p_reason, ''))) not between 2 and 500
    or (v_type = 'boleta' and (
      not coalesce(v_document ~ '^[0-9]{8}$', false)
      or coalesce(length(v_name) between 2 and 250, false) is false
    ))
    or (v_type = 'factura' and (
      not coalesce(v_document ~ '^[0-9]{11}$', false)
      or coalesce(length(v_name) between 2 and 250, false) is false
      or coalesce(length(v_address) between 2 and 250, false) is false
    ))
    or v_type is null or v_type not in ('boleta', 'factura')
  then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  select * into v_before from public.member_group_requests
  where id = p_request_id for update;
  if not found or v_before.is_free_snapshot then
    raise exception 'GROUP_NOT_FOUND' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.activities activity where activity.id = v_before.activity_id
    and (activity.status = 'archived' or activity.deleted_at is not null)) then
    raise exception 'GROUP_ARCHIVED' using errcode = 'P0001';
  end if;

  update public.member_group_requests set
    billing_type = v_type,
    billing_document = v_document,
    billing_name = v_name,
    billing_address = case when v_type = 'factura' then v_address else null end
  where id = p_request_id;

  insert into public.audit_logs(
    actor_user_id, action, entity_type, entity_id, old_data, new_data, metadata
  ) values (
    auth.uid(), 'member_group.billing_corrected', 'member_group_request', p_request_id,
    jsonb_build_object('billing_type', v_before.billing_type,
      'billing_document', v_before.billing_document, 'billing_name', v_before.billing_name,
      'billing_address', v_before.billing_address),
    jsonb_build_object('billing_type', v_type, 'billing_document', v_document,
      'billing_name', v_name, 'billing_address', case when v_type = 'factura' then v_address else null end),
    jsonb_build_object('reason', btrim(p_reason))
  );
  return jsonb_build_object('request_id', p_request_id, 'changed', true);
end;
$$;

revoke execute on function public.correct_member_group_billing(uuid, jsonb, text) from public, anon;
grant execute on function public.correct_member_group_billing(uuid, jsonb, text)
  to authenticated, service_role;
