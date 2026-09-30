-- Validate new certificate configurations without backfilling historical data.
create function public.validate_activity_certificate_hours()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.certificate_mode <> 'none' and (new.academic_hours is null or new.academic_hours <= 0) then
    raise exception 'ACADEMIC_HOURS_REQUIRED' using errcode = '22023';
  end if;
  return new;
end;
$$;
create trigger validate_activity_certificate_hours
before insert or update of certificate_mode, academic_hours on public.activities
for each row execute function public.validate_activity_certificate_hours();
revoke all on function public.validate_activity_certificate_hours() from public, anon, authenticated, service_role;

-- Issuance must also protect activities configured before this validation existed.
do $$
declare
  v_definition text;
  v_rule text := 'when v_registration.current_certificate_mode = ''none'' then ''CERTIFICATE_NOT_AVAILABLE''';
begin
  select pg_get_functiondef('public.prepare_activity_certificates(uuid[],uuid,text)'::regprocedure) into v_definition;
  if strpos(v_definition, v_rule) = 0 then raise exception 'Expected certificate entitlement validation was not found'; end if;
  execute replace(v_definition, v_rule, v_rule || E'\n      when v_registration.academic_hours is null or v_registration.academic_hours <= 0 then ''ACADEMIC_HOURS_REQUIRED''');
end;
$$;

create function public.replace_activity_certificate_hours(
  p_certificate_id uuid,
  p_activity_id uuid,
  p_new_hours numeric,
  p_expected_file_path text,
  p_new_file_path text
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_activity public.activities%rowtype;
  v_certificate public.certificates%rowtype;
  v_old public.certificates%rowtype;
begin
  if not public.is_active_admin() then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  if p_certificate_id is null or p_activity_id is null or p_new_hours is null
    or p_new_hours <= 0 or p_new_hours > 9999.99
    or p_new_file_path is null
    or p_new_file_path !~ ('^issued/' || p_certificate_id::text || '/[A-Za-z0-9-]+[.]pdf$')
    or p_new_file_path = p_expected_file_path
  then raise exception 'VALIDATION_ERROR' using errcode = '22023'; end if;

  select * into v_activity from public.activities
  where id = p_activity_id and deleted_at is null and status <> 'archived' for share;
  if not found then raise exception 'ACTIVITY_NOT_AVAILABLE' using errcode = 'P0001'; end if;
  if v_activity.academic_hours is distinct from p_new_hours then
    raise exception 'ACTIVITY_HOURS_CHANGED' using errcode = '40001';
  end if;

  select * into v_certificate from public.certificates
  where id = p_certificate_id and deleted_at is null for update;
  if not found then raise exception 'CERTIFICATE_NOT_FOUND' using errcode = 'P0001'; end if;
  if v_certificate.certificate_type <> 'activity' or not exists (
    select 1 from public.registrations where id = v_certificate.registration_id
      and activity_id = p_activity_id and deleted_at is null
  ) then raise exception 'CERTIFICATE_ACTIVITY_MISMATCH' using errcode = 'P0001'; end if;
  if v_certificate.status <> 'issued' or v_certificate.file_path is null then
    raise exception 'CERTIFICATE_NOT_ISSUED' using errcode = 'P0001';
  end if;
  if v_certificate.file_path is distinct from p_expected_file_path
  then raise exception 'CERTIFICATE_CHANGED' using errcode = '40001'; end if;

  v_old := v_certificate;
  update public.certificates set academic_hours_snapshot = p_new_hours, file_path = p_new_file_path
  where id = v_certificate.id returning * into v_certificate;
  insert into public.audit_logs(actor_user_id, action, entity_type, entity_id, old_data, new_data)
  values (auth.uid(), 'certificate.hours_corrected', 'certificate', v_certificate.id, to_jsonb(v_old), to_jsonb(v_certificate));
  return jsonb_build_object('certificate_id', v_certificate.id);
end;
$$;
revoke all on function public.replace_activity_certificate_hours(uuid, uuid, numeric, text, text) from public, anon;
grant execute on function public.replace_activity_certificate_hours(uuid, uuid, numeric, text, text) to authenticated, service_role;
comment on function public.replace_activity_certificate_hours(uuid, uuid, numeric, text, text) is
  'Explicit audited correction of activity certificate hours and PDF, preserving code, token, issue date and other snapshots; no notification is sent.';
