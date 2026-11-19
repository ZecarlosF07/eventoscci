create function public.replace_activity_certificate_details(
  p_certificate_id uuid,
  p_activity_id uuid,
  p_new_hours numeric,
  p_new_title text,
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
    or p_new_title is null or length(btrim(p_new_title)) not between 1 and 300
    or p_new_file_path is null or p_expected_file_path is null
    or p_new_file_path !~ ('^issued/' || p_certificate_id::text || '/[A-Za-z0-9-]+[.]pdf$')
    or p_new_file_path = p_expected_file_path
  then raise exception 'VALIDATION_ERROR' using errcode = '22023'; end if;

  select * into v_activity from public.activities
  where id = p_activity_id and deleted_at is null and status <> 'archived' for share;
  if not found then raise exception 'ACTIVITY_NOT_AVAILABLE' using errcode = 'P0001'; end if;
  if v_activity.academic_hours is distinct from p_new_hours
    or v_activity.title is distinct from p_new_title
  then raise exception 'ACTIVITY_DETAILS_CHANGED' using errcode = '40001'; end if;

  select * into v_certificate from public.certificates
  where id = p_certificate_id and deleted_at is null for update;
  if not found then raise exception 'CERTIFICATE_NOT_FOUND' using errcode = 'P0001'; end if;
  if v_certificate.certificate_type <> 'activity' or v_certificate.recipient_type <> 'participant'
    or not exists (
      select 1 from public.registrations where id = v_certificate.registration_id
      and activity_id = p_activity_id and deleted_at is null
    )
  then raise exception 'CERTIFICATE_ACTIVITY_MISMATCH' using errcode = 'P0001'; end if;
  if v_certificate.status <> 'issued' or v_certificate.file_path is null
  then raise exception 'CERTIFICATE_NOT_ISSUED' using errcode = 'P0001'; end if;
  if v_certificate.file_path is distinct from p_expected_file_path
  then raise exception 'CERTIFICATE_CHANGED' using errcode = '40001'; end if;

  v_old := v_certificate;
  update public.certificates
  set academic_hours_snapshot = p_new_hours, title_snapshot = p_new_title, file_path = p_new_file_path
  where id = v_certificate.id returning * into v_certificate;
  insert into public.audit_logs(actor_user_id, action, entity_type, entity_id, old_data, new_data)
  values(auth.uid(), 'certificate.details_corrected', 'certificate', v_certificate.id, to_jsonb(v_old), to_jsonb(v_certificate));
  return jsonb_build_object('certificate_id', v_certificate.id);
end;
$$;

revoke all on function public.replace_activity_certificate_details(uuid, uuid, numeric, text, text, text) from public, anon;
grant execute on function public.replace_activity_certificate_details(uuid, uuid, numeric, text, text, text) to authenticated, service_role;
comment on function public.replace_activity_certificate_details(uuid, uuid, numeric, text, text, text) is
  'Explicit audited replacement of participant certificate hours, activity title and PDF; validates current activity values and prior file under locks.';
