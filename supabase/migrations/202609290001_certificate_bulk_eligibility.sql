-- Recheck the same certificate entitlement used by the ready-candidates view
-- inside the issuance transaction, including optional-certificate payment.
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
  v_reason text;
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
      registrations.certificate_mode_snapshot,
      registrations.certificate_requested_at,
      registrations.certificate_payment_verified_at,
      attendance.status as attendance_status,
      people.first_names,
      people.last_names,
      activities.title,
      activities.academic_hours,
      activities.certificate_mode as current_certificate_mode,
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
    join public.activities on activities.id = registrations.activity_id
      and activities.deleted_at is null and activities.status <> 'archived'
    join public.attendance on attendance.registration_id = registrations.id and attendance.deleted_at is null
    where registrations.id = any(p_registration_ids) and registrations.deleted_at is null
    order by registrations.id
    for update of registrations, attendance
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

    v_reason := case
      when v_registration.current_certificate_mode = 'none' then 'CERTIFICATE_NOT_AVAILABLE'
      when v_registration.current_certificate_mode = 'included'
        or v_registration.certificate_mode_snapshot = 'included' then null
      when v_registration.certificate_mode_snapshot = 'optional_paid'
        and v_registration.certificate_requested_at is not null
        and v_registration.certificate_payment_verified_at is not null then null
      else 'CERTIFICATE_PAYMENT_OR_REQUEST_PENDING'
    end;
    if v_reason is not null then
      v_rejected := v_rejected || jsonb_build_array(jsonb_build_object(
        'registration_id', v_registration.id, 'reason', v_reason
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
