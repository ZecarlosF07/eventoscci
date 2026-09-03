begin;

select no_plan();

select ok(to_regprocedure('public.search_public_certificates_by_dni(text,inet,text,uuid)') is not null, 'DNI lookup RPC exists');
select ok(exists (select 1 from pg_indexes where indexname = 'idx_audit_logs_certificate_search_ip'), 'rate-limit index exists');
select ok(exists (select 1 from pg_indexes where indexname = 'idx_audit_logs_certificate_search_document'), 'document audit index exists');
select is(has_function_privilege('anon', 'public.search_public_certificates_by_dni(text,inet,text,uuid)', 'EXECUTE'), false, 'anonymous clients cannot execute lookup RPC');
select is(has_function_privilege('authenticated', 'public.search_public_certificates_by_dni(text,inet,text,uuid)', 'EXECUTE'), false, 'authenticated clients cannot execute lookup RPC');
select ok(has_function_privilege('service_role', 'public.search_public_certificates_by_dni(text,inet,text,uuid)', 'EXECUTE'), 'server role can execute lookup RPC');

insert into public.people (
  id, document_type, document_number, first_names, last_names, email, phone, job_title
) values
  ('3f000000-0000-4000-8000-000000000001', 'dni', '29000001', 'Persona', 'Certificada', 'certificada15@example.test', '929000001', 'Gerente'),
  ('3f000000-0000-4000-8000-000000000002', 'dni', '29000002', 'Persona', 'Sin Certificado', 'sincert15@example.test', '929000002', 'Analista');

insert into public.categories (id, name, slug, is_active)
values ('1f000000-0000-4000-8000-000000000001', 'Gestión H15', 'gestion-h15', true);

insert into public.activity_contacts (
  id, label, contact_name, whatsapp_phone, email, is_active
) values (
  '2f000000-0000-4000-8000-000000000001',
  'Contacto H15', 'Contacto de prueba', '929000015',
  'contacto15@example.test', true
);

insert into public.activities (
  id, category_id, contact_id, type, title, slug, description, modality, is_free,
  general_price, member_price, status, published_at
) values (
  '4f000000-0000-4000-8000-000000000001',
  '1f000000-0000-4000-8000-000000000001',
  '2f000000-0000-4000-8000-000000000001',
  'training', 'Actividad H15', 'actividad-h15', 'Actividad certificada',
  'virtual', true, 0, 0, 'published', now()
);

insert into public.registrations (
  id, activity_id, person_id, registration_code, status, confirmed_at
) values (
  '6f000000-0000-4000-8000-000000000001',
  '4f000000-0000-4000-8000-000000000001',
  '3f000000-0000-4000-8000-000000000001',
  'REG-H15-001', 'confirmed', now()
);

insert into public.courses (
  id, title, slug, description, is_free, general_price, member_price, status, published_at
) values (
  '5f000000-0000-4000-8000-000000000001',
  'Curso H15', 'curso-h15', 'Curso certificado', true, 0, 0, 'published', now()
);

insert into public.course_enrollments (
  id, course_id, person_id, status, progress_percent, completed_at
) values (
  '9f000000-0000-4000-8000-000000000001',
  '5f000000-0000-4000-8000-000000000001',
  '3f000000-0000-4000-8000-000000000001',
  'completed', 100, now()
);

insert into public.certificate_templates (id, name, scope, is_active)
values
  ('cf000000-0000-4000-8000-000000000001', 'Actividad H15', 'activity', true),
  ('cf000000-0000-4000-8000-000000000002', 'Curso H15', 'course', true);

insert into public.certificates (
  id, person_id, template_id, registration_id, course_enrollment_id,
  certificate_type, certificate_code, participant_name_snapshot,
  title_snapshot, condition_snapshot, file_path, access_token, status,
  revoked_at, revocation_reason
) values
  (
    'af000000-0000-4000-8000-000000000001',
    '3f000000-0000-4000-8000-000000000001',
    'cf000000-0000-4000-8000-000000000001',
    '6f000000-0000-4000-8000-000000000001', null,
    'activity', 'CCI-H15-001', 'Persona Certificada', 'Actividad H15',
    'Participó', 'issued/h15-activity.pdf',
    'df000000-0000-4000-8000-000000000001', 'issued', null, null
  ),
  (
    'af000000-0000-4000-8000-000000000002',
    '3f000000-0000-4000-8000-000000000001',
    'cf000000-0000-4000-8000-000000000002',
    null, '9f000000-0000-4000-8000-000000000001',
    'course', 'CCI-H15-002', 'Persona Certificada', 'Curso H15',
    'Aprobó', null, 'df000000-0000-4000-8000-000000000002',
    'revoked', now(), 'Corrección institucional'
  );

set local role service_role;

select is(
  public.search_public_certificates_by_dni('123', '203.0.113.1', 'pgTAP', null)->>'status',
  'invalid',
  'invalid DNI is rejected'
);
select is((select count(*) from public.audit_logs where action = 'certificate.public_search' and new_data->>'outcome' = 'invalid' and new_data->>'document_number' = '123'), 1::bigint, 'invalid DNI is audited');

select is(
  public.search_public_certificates_by_dni('29000002', '203.0.113.2', 'pgTAP', null)->>'status',
  'not_found',
  'DNI without certificates returns not found'
);
select is((select count(*) from public.audit_logs where action = 'certificate.public_search' and new_data->>'document_number' = '29000002'), 1::bigint, 'empty result is audited');

create temporary table hito15_lookup as
select public.search_public_certificates_by_dni('29000001', '203.0.113.3', 'pgTAP', null) result;

select is((select result->>'status' from hito15_lookup), 'found', 'matching DNI returns certificates');
select is((select jsonb_array_length(result->'certificates') from hito15_lookup), 2, 'all active certificates are returned');
select is((select result->>'participant_name' from hito15_lookup), 'Persona Certificada', 'participant name is returned');
select is((select result->'recommendation_context'->>'source_category_id' from hito15_lookup), '1f000000-0000-4000-8000-000000000001', 'latest activity category is returned for recommendations');
select is((select count(*) from public.audit_logs where action = 'certificate.public_search' and new_data->>'document_number' = '29000001' and new_data->>'result_count' = '2'), 1::bigint, 'successful lookup and count are audited');
select is((select host(ip_address) from public.audit_logs where action = 'certificate.public_search' and new_data->>'document_number' = '29000001'), '203.0.113.3', 'request IP is audited');
select is(public.get_public_certificate('df000000-0000-4000-8000-000000000001')->>'source_activity_type', 'training', 'token lookup includes activity context');
select is(public.get_public_certificate('df000000-0000-4000-8000-000000000001')->>'certificate_type', 'activity', 'token lookup includes certificate type');

insert into public.audit_logs (action, entity_type, new_data, ip_address)
select 'certificate.public_search', 'certificate_public_query', jsonb_build_object('document_number', '00000000', 'outcome', 'not_found', 'result_count', 0), '203.0.113.60'::inet
from generate_series(1, 60);
select is(public.search_public_certificates_by_dni('29000001', '203.0.113.60', 'pgTAP', null)->>'status', 'rate_limited', 'sixty recent searches activate the limit');
select is((select count(*) from public.audit_logs where action = 'certificate.public_search.rate_limited' and ip_address = '203.0.113.60'), 1::bigint, 'blocked lookup is audited separately');

reset role;

select * from finish(true);
rollback;
