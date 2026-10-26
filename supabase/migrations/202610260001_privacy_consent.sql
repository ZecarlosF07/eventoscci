-- Compatible foundation. Enforcement is enabled separately after frontend publication.
create table public.privacy_policy_versions (
  version text primary key,
  content jsonb not null,
  created_at timestamptz not null default clock_timestamp()
);
insert into public.privacy_policy_versions(version,content) values ('2026-10-26.v1', $policy${"version": "2026-10-26.v1", "publishedAt": "26 de octubre de 2026", "contact": "comercial@camaraica.org.pe", "notices": {"individual": "He leído la Política de privacidad y autorizo el tratamiento de mis datos para gestionar mi inscripción, las comunicaciones relacionadas y mis certificados.", "campus": "He leído la Política de privacidad y autorizo el tratamiento de mis datos para crear mi cuenta, gestionar mi formación en el Campus y mis certificados.", "group": "Confirmo que he informado a todos los asistentes sobre la Política de privacidad y cuento con su autorización para registrar sus datos, gestionar su inscripción, las comunicaciones relacionadas y sus certificados.", "marketing": "Quiero recibir información de próximos eventos, capacitaciones y cursos por correo y WhatsApp. Puedo retirar esta autorización escribiendo a comercial@camaraica.org.pe.", "groupMarketing": "Confirmo que todos los asistentes me han autorizado a recibir información de próximos eventos, capacitaciones y cursos por correo y WhatsApp. Cada persona puede retirar su autorización escribiendo a comercial@camaraica.org.pe."}, "sections": [{"title": "Quién trata tus datos", "paragraphs": ["La Cámara de Comercio de Ica es responsable del tratamiento de los datos recogidos por este portal de eventos, capacitaciones y Campus Virtual. Nuestro domicilio institucional es Urb. Sr. de Luren, C. Pedro Olaechea 285, Ica, Perú. Para consultas y solicitudes de privacidad escribe a comercial@camaraica.org.pe."]}, {"title": "Qué datos recogemos", "paragraphs": ["Según el servicio, solicitamos nombres, DNI o CE, correo y celular; empresa u organización, RUC, cargo y provincia; o institución educativa y carrera. También registramos inscripciones, asistencia, progreso académico, evaluaciones y certificados. Para actividades pagadas recogemos los datos necesarios para el comprobante y la gestión del pago; no pedimos datos de tarjetas bancarias en los formularios de inscripción.", "Los campos obligatorios están identificados. Los opcionales pueden quedar vacíos. Si no proporcionas los datos necesarios o no autorizas el tratamiento requerido para el registro, no podremos completar esa inscripción o cuenta. No aceptar publicidad no limita tu participación."]}, {"title": "Para qué los utilizamos", "paragraphs": ["Usamos tus datos para gestionar tu inscripción o cuenta, cupos y accesos, comunicaciones sobre la actividad, asistencia, pagos y comprobantes cuando correspondan, formación, soporte y certificados. No utilizamos la aceptación de inscripción como autorización para publicidad.", "Solo si marcas la casilla opcional utilizaremos tu correo y celular para informarte de próximos eventos, capacitaciones y cursos por correo y WhatsApp. Puedes retirar esa autorización sin afectar tus inscripciones ni certificados. En registros grupales, quien registra declara que informó y obtuvo la autorización de todos los asistentes para las finalidades seleccionadas."]}, {"title": "Quién puede acceder y proveedores tecnológicos", "paragraphs": ["El personal autorizado de la Cámara accede a los datos necesarios para sus funciones. Utilizamos Supabase para base de datos, autenticación y archivos; Vercel para alojamiento; y herramientas de automatización y correo para comunicaciones operativas. El Campus puede usar Vimeo para reproducir clases. Al usar WhatsApp o acceder a enlaces externos también se aplican las condiciones de esos servicios.", "Estos proveedores pueden tratar datos fuera del Perú para prestar sus servicios. El portal no publica documentos de identidad ni datos de contacto de participantes en los catálogos públicos. Las verificaciones de certificados muestran únicamente la información necesaria para comprobarlos. No ofrecemos tus datos como una base de contactos de libre acceso."]}, {"title": "Durante cuánto tiempo los conservamos", "paragraphs": ["Conservamos los datos mientras sean necesarios para gestionar los servicios solicitados y cumplir obligaciones legales aplicables. Los registros académicos, certificados y evidencias de autorización pueden mantenerse cuando sean necesarios para acreditar la formación, verificar documentos o atender responsabilidades. Una solicitud de cancelación se evaluará considerando estas obligaciones; retirar la publicidad no elimina el historial académico."]}, {"title": "Tus derechos y cómo dejar de recibir publicidad", "paragraphs": ["Puedes solicitar acceso, rectificación, cancelación u oposición al tratamiento de tus datos y retirar tu consentimiento escribiendo a comercial@camaraica.org.pe, indicando tu solicitud y los datos necesarios para identificar el registro. Verificaremos tu identidad de forma proporcional antes de entregar o modificar información. No envíes contraseñas.", "Para dejar de recibir publicidad, escribe al mismo correo indicando “Baja de publicidad”. La Cámara registrará la baja y dejará de incluirte en sus listas promocionales. Esto no impide las comunicaciones necesarias sobre actividades en las que ya participas. Si consideras que tus derechos no han sido atendidos, puedes acudir a la Autoridad Nacional de Protección de Datos Personales."]}, {"title": "Cookies y estadísticas", "paragraphs": ["El portal utiliza cookies necesarias para autenticación y funcionamiento. Cuando Google Analytics está configurado, también registra estadísticas de navegación mediante cookies e identificadores del navegador. No enviamos a Analytics nombres, documentos, RUC, correos ni teléfonos de los formularios. Puedes administrar las cookies desde tu navegador; bloquear las necesarias puede afectar el acceso al Campus.", "Esta versión del portal no muestra un aviso de aceptación de cookies de analítica. La aceptación del formulario se refiere a las finalidades descritas en sus casillas y no se registra como consentimiento de Analytics."]}, {"title": "Cambios de esta política", "paragraphs": ["Identificamos cada versión de esta política y conservamos el texto vinculado a las aceptaciones registradas. Si cambiamos las finalidades que requieren autorización, solicitaremos la aceptación correspondiente. Esta política se interpreta conforme a la Ley N.º 29733 y su reglamento vigente."]}]}$policy$::jsonb);
alter table public.privacy_policy_versions enable row level security;
revoke all on public.privacy_policy_versions from anon, authenticated, service_role;

create function public.current_privacy_version() returns text
language sql immutable set search_path = '' as $$ select '2026-10-26.v1'::text $$;
create function public.privacy_consent_enforced() returns boolean
language sql stable set search_path = '' as $$ select false $$;
revoke all on function public.privacy_consent_enforced() from public,anon,authenticated,service_role;

create table public.privacy_consent_records (
  id uuid primary key default gen_random_uuid(),
  sequence bigint generated always as identity unique,
  person_id uuid not null references public.people(id),
  purpose text not null check (purpose in ('activity_registration','campus','marketing')),
  action text not null check (action in ('accepted','declined','withdrawn')),
  policy_version text not null references public.privacy_policy_versions(version),
  source text not null check (source in ('individual','group','campus_registration','campus_enrollment','admin')),
  actor_type text not null check (actor_type in ('self','representative','staff')),
  registration_id uuid references public.registrations(id),
  group_request_id uuid references public.member_group_requests(id),
  user_id uuid references auth.users(id),
  recorded_by uuid references auth.users(id),
  recorded_at timestamptz not null default clock_timestamp(),
  channels text[] not null default '{}',
  reason text,
  check (purpose='marketing' or (action='accepted' and channels='{}')),
  check (purpose<>'marketing' or channels=array['email','whatsapp']::text[]),
  check (action<>'withdrawn' or (source='admin' and actor_type='staff' and recorded_by is not null and length(btrim(reason)) between 2 and 500)),
  check (source<>'group' or (registration_id is not null and group_request_id is not null and actor_type='representative'))
);
create index privacy_consent_person_history on public.privacy_consent_records(person_id,sequence desc);
create unique index privacy_consent_registration_purpose on public.privacy_consent_records(registration_id,purpose) where registration_id is not null;
alter table public.privacy_consent_records enable row level security;
revoke all on public.privacy_consent_records from public,anon,authenticated,service_role;
grant select on public.privacy_consent_records to authenticated;
create policy privacy_consent_internal_read on public.privacy_consent_records for select to authenticated using ((select public.is_internal_user()));

create function public.prevent_privacy_history_mutation() returns trigger
language plpgsql set search_path = '' as $$ begin raise exception 'PRIVACY_HISTORY_IMMUTABLE' using errcode='42501'; end $$;
create trigger privacy_versions_immutable before update or delete on public.privacy_policy_versions for each row execute function public.prevent_privacy_history_mutation();
create trigger privacy_records_immutable before update or delete on public.privacy_consent_records for each row execute function public.prevent_privacy_history_mutation();
revoke all on function public.prevent_privacy_history_mutation() from public,anon,authenticated,service_role;

create function public.assert_privacy_input(p_input jsonb) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if p_input->'privacy_accepted' is distinct from 'true'::jsonb then
    raise exception 'PRIVACY_CONSENT_REQUIRED' using errcode='22023';
  end if;
  if p_input->>'privacy_version' is distinct from public.current_privacy_version() then
    raise exception 'PRIVACY_POLICY_CHANGED' using errcode='22023';
  end if;
  if p_input ? 'marketing_accepted' and jsonb_typeof(p_input->'marketing_accepted') is distinct from 'boolean' then
    raise exception 'PRIVACY_CONSENT_REQUIRED' using errcode='22023';
  end if;
end $$;
revoke all on function public.assert_privacy_input(jsonb) from public,anon,authenticated,service_role;

create function public.record_privacy_consent(p_person_id uuid,p_input jsonb,p_source text,p_purpose text,
  p_registration_id uuid default null,p_group_id uuid default null,p_user_id uuid default null)
returns void language plpgsql security definer set search_path = '' as $$
declare v_actor text := case when p_source='group' then 'representative' else 'self' end;
begin
  if not (p_input ? 'privacy_accepted') then return; end if;
  perform public.assert_privacy_input(p_input);
  -- Serialize consent and withdrawal events for the same participant.
  perform pg_advisory_xact_lock(hashtextextended('privacy:'||p_person_id::text,0));
  insert into public.privacy_consent_records(person_id,purpose,action,policy_version,source,actor_type,registration_id,group_request_id,user_id,recorded_by)
  values(p_person_id,p_purpose,'accepted',public.current_privacy_version(),p_source,v_actor,p_registration_id,p_group_id,p_user_id,auth.uid());
  insert into public.privacy_consent_records(person_id,purpose,action,policy_version,source,actor_type,registration_id,group_request_id,user_id,recorded_by,channels)
  values(p_person_id,'marketing',case when p_input->'marketing_accepted'='true'::jsonb then 'accepted' else 'declined' end,
    public.current_privacy_version(),p_source,v_actor,p_registration_id,p_group_id,p_user_id,auth.uid(),array['email','whatsapp']);
end $$;
revoke all on function public.record_privacy_consent(uuid,jsonb,text,text,uuid,uuid,uuid) from public,anon,authenticated,service_role;

alter function public.register_activity(uuid,jsonb) rename to register_activity_before_privacy;
revoke all on function public.register_activity_before_privacy(uuid,jsonb) from public,anon,authenticated,service_role;
create function public.register_activity(p_activity_id uuid,p_registration jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_result jsonb; v_registration public.registrations%rowtype;
begin
  if public.privacy_consent_enforced() or p_registration ? 'privacy_accepted' then perform public.assert_privacy_input(p_registration); end if;
  v_result := public.register_activity_before_privacy(p_activity_id,p_registration);
  select * into strict v_registration from public.registrations where id=(v_result->>'registration_id')::uuid;
  perform public.record_privacy_consent(v_registration.person_id,p_registration,'individual','activity_registration',v_registration.id);
  return v_result;
end $$;
revoke all on function public.register_activity(uuid,jsonb) from public;
grant execute on function public.register_activity(uuid,jsonb) to anon,authenticated,service_role;

alter function public.register_member_group(uuid,jsonb,uuid) rename to register_member_group_before_privacy;
revoke all on function public.register_member_group_before_privacy(uuid,jsonb,uuid) from public,anon,authenticated,service_role;
create function public.register_member_group(p_activity_id uuid,p_request jsonb,p_idempotency_key uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_result jsonb; v_registration public.registrations%rowtype; v_exists boolean;
begin
  if p_idempotency_key is null then raise exception 'VALIDATION_ERROR' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtext(p_idempotency_key::text));
  select exists(select 1 from public.member_group_requests where idempotency_key=p_idempotency_key) into v_exists;
  -- Historical successful requests remain recoverable through the existing hash/token checks.
  if not v_exists and (public.privacy_consent_enforced() or p_request ? 'privacy_accepted') then perform public.assert_privacy_input(p_request); end if;
  v_result := public.register_member_group_before_privacy(p_activity_id,p_request,p_idempotency_key);
  if not v_exists then
    -- Consistent person order avoids deadlocks between overlapping groups.
    for v_registration in select * from public.registrations where member_group_request_id=(v_result->>'request_id')::uuid order by person_id loop
      perform public.record_privacy_consent(v_registration.person_id,p_request,'group','activity_registration',v_registration.id,v_registration.member_group_request_id);
    end loop;
  end if;
  return v_result;
end $$;
revoke all on function public.register_member_group(uuid,jsonb,uuid) from public;
grant execute on function public.register_member_group(uuid,jsonb,uuid) to anon,authenticated,service_role;

-- Extend the existing Auth trigger rather than relying on mutable user metadata as evidence.
do $$
declare v_definition text;
begin
  select pg_get_functiondef('public.handle_campus_user_registration()'::regprocedure) into v_definition;
  if strpos(v_definition,'if v_document_type_text not in')=0 or strpos(v_definition,'  return new;')=0 then raise exception 'PRIVACY_AUTH_PATCH_NOT_FOUND'; end if;
  v_definition := replace(v_definition,'  if v_document_type_text not in',
    '  if public.privacy_consent_enforced() or v_metadata ? ''privacy_accepted'' then perform public.assert_privacy_input(v_metadata); end if;
  if v_document_type_text not in');
  -- Only the final return follows account creation; preserve the early non-Campus return.
  v_definition := replace(v_definition,'  return new;
end;',
    '  perform public.record_privacy_consent(v_person.id,v_metadata,''campus_registration'',''campus'',null,null,new.id);
  return new;
end;');
  if strpos(v_definition,'perform public.record_privacy_consent')=0 then raise exception 'PRIVACY_AUTH_RECORD_PATCH_NOT_FOUND'; end if;
  execute v_definition;
end $$;
-- Scrub transient acceptance fields after the preceding trigger has persisted the evidence.
create function public.scrub_privacy_auth_metadata() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update auth.users set raw_user_meta_data=coalesce(raw_user_meta_data,'{}'::jsonb)-'privacy_accepted'-'privacy_version'-'marketing_accepted' where id=new.id;
  return new;
end $$;
create trigger zzz_scrub_privacy_auth_metadata after insert on auth.users for each row execute function public.scrub_privacy_auth_metadata();
revoke all on function public.scrub_privacy_auth_metadata() from public,anon,authenticated,service_role;

create function public.has_current_campus_privacy() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.privacy_consent_records c
    where c.person_id=public.current_person_id() and c.user_id=auth.uid() and c.purpose='campus'
      and c.action='accepted' and c.policy_version=public.current_privacy_version());
$$;
revoke all on function public.has_current_campus_privacy() from public,anon;
grant execute on function public.has_current_campus_privacy() to authenticated,service_role;

alter function public.enroll_free_course(uuid) rename to enroll_free_course_before_privacy;
revoke all on function public.enroll_free_course_before_privacy(uuid) from public,anon,authenticated,service_role;
create function public.enroll_free_course(p_course_id uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
begin
  if public.privacy_consent_enforced() and not public.has_current_campus_privacy() and not exists(
    select 1 from public.course_enrollments where course_id=p_course_id and person_id=public.current_person_id() and status in ('active','completed') and deleted_at is null
  ) then raise exception 'PRIVACY_CONSENT_REQUIRED' using errcode='22023'; end if;
  return public.enroll_free_course_before_privacy(p_course_id);
end $$;
revoke all on function public.enroll_free_course(uuid) from public,anon;
grant execute on function public.enroll_free_course(uuid) to authenticated,service_role;
create function public.enroll_free_course_with_privacy(p_course_id uuid,p_privacy jsonb) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_enrollment_id uuid; v_person_id uuid:=public.current_person_id();
begin
  if v_person_id is null then raise exception 'ACCOUNT_NOT_ACTIVE' using errcode='42501'; end if;
  perform pg_advisory_xact_lock(hashtextextended('privacy:'||v_person_id::text,0));
  if not public.has_current_campus_privacy() then
    perform public.assert_privacy_input(p_privacy);
    perform public.record_privacy_consent(v_person_id,p_privacy,'campus_enrollment','campus',null,null,auth.uid());
  end if;
  v_enrollment_id:=public.enroll_free_course_before_privacy(p_course_id);
  return v_enrollment_id;
end $$;
revoke all on function public.enroll_free_course_with_privacy(uuid,jsonb) from public,anon;
grant execute on function public.enroll_free_course_with_privacy(uuid,jsonb) to authenticated,service_role;

create view public.authorized_marketing_contacts with (security_invoker=true) as
select p.id as person_id,p.first_names,p.last_names,p.email,p.phone,c.recorded_at as authorized_at,c.policy_version
from public.people p
join lateral (select action,recorded_at,policy_version from public.privacy_consent_records
  where person_id=p.id and purpose='marketing' and action in ('accepted','withdrawn') order by sequence desc limit 1) c on c.action='accepted'
where p.deleted_at is null;
revoke all on public.authorized_marketing_contacts from public,anon,authenticated,service_role;
grant select on public.authorized_marketing_contacts to authenticated;

create function public.withdraw_marketing_consent(p_person_id uuid,p_reason text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_internal_user() then raise exception 'FORBIDDEN' using errcode='42501'; end if;
  if p_reason is null or length(btrim(p_reason)) not between 2 and 500 then raise exception 'VALIDATION_ERROR' using errcode='22023'; end if;
  if not exists(select 1 from public.people where id=p_person_id and deleted_at is null) then raise exception 'PARTICIPANT_NOT_FOUND' using errcode='P0001'; end if;
  perform pg_advisory_xact_lock(hashtextextended('privacy:'||p_person_id::text,0));
  insert into public.privacy_consent_records(person_id,purpose,action,policy_version,source,actor_type,recorded_by,channels,reason)
  values(p_person_id,'marketing','withdrawn',public.current_privacy_version(),'admin','staff',auth.uid(),array['email','whatsapp'],btrim(p_reason));
  insert into public.audit_logs(actor_user_id,action,entity_type,entity_id,metadata)
  values(auth.uid(),'marketing_consent_withdrawn','person',p_person_id,jsonb_build_object('reason',btrim(p_reason)));
end $$;
revoke all on function public.withdraw_marketing_consent(uuid,text) from public,anon;
grant execute on function public.withdraw_marketing_consent(uuid,text) to authenticated;
