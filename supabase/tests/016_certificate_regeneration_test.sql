begin;

select no_plan();

select ok(
  to_regprocedure('public.replace_certificate_document(uuid,uuid,text,text,text)') is not null,
  'certificate replacement RPC exists'
);
select ok(
  to_regprocedure('public.get_activity_certificate_candidates(uuid,text,integer,integer)') is not null,
  'paginated certificate candidate RPC exists'
);
select ok(
  exists (select 1 from pg_indexes where indexname = 'idx_activities_title_trgm_active'),
  'activity title search has a trigram index'
);
select ok(
  exists (select 1 from pg_indexes where indexname = 'idx_people_full_name_trgm_active'),
  'participant full-name search has a trigram index'
);
select ok(
  exists (select 1 from pg_indexes where indexname = 'idx_registrations_code_trgm_active'),
  'registration code search has a trigram index'
);
select is(
  has_function_privilege('anon', 'public.replace_certificate_document(uuid,uuid,text,text,text)', 'EXECUTE'),
  false,
  'anonymous users cannot replace certificate documents'
);
select ok(
  has_function_privilege('authenticated', 'public.replace_certificate_document(uuid,uuid,text,text,text)', 'EXECUTE'),
  'authenticated internal users can reach the guarded replacement RPC'
);

insert into auth.users (id, email) values
  ('89000000-0000-4000-8000-000000000001', 'certificate16.student@example.test'),
  ('89000000-0000-4000-8000-000000000002', 'certificate16.operator@example.test');

insert into public.people (
  id, document_type, document_number, first_names, last_names, email, phone, job_title
) values
  ('39000000-0000-4000-8000-000000000001', 'dni', '29000001', 'Nombre', 'Correcto', 'certificate16.person@example.test', '929000001', 'Analista'),
  ('39000000-0000-4000-8000-000000000002', 'dni', '29000002', 'Alumno', 'Prueba', 'certificate16.student@example.test', '929000002', 'Estudiante'),
  ('39000000-0000-4000-8000-000000000003', 'dni', '29000003', 'Operador', 'Prueba', 'certificate16.operator@example.test', '929000003', 'Operador');

insert into public.user_accounts (user_id, person_id, role) values
  ('89000000-0000-4000-8000-000000000001', '39000000-0000-4000-8000-000000000002', 'student'),
  ('89000000-0000-4000-8000-000000000002', '39000000-0000-4000-8000-000000000003', 'operator');

insert into public.activities (
  id, type, title, slug, description, modality, is_free, contact_phone, status, published_at
) values
  ('79000000-0000-4000-8000-000000000001', 'training', 'Actividad Regeneración', 'actividad-regeneracion-16', 'Prueba de regeneración', 'virtual', true, '900000016', 'published', now()),
  ('79000000-0000-4000-8000-000000000002', 'event', 'Actividad Secundaria', 'actividad-secundaria-16', 'Prueba de paginación', 'in_person', true, '900000016', 'published', now());

insert into public.registrations (
  id, activity_id, person_id, registration_code, status, confirmed_at
) values (
  '78000000-0000-4000-8000-000000000001',
  '79000000-0000-4000-8000-000000000001',
  '39000000-0000-4000-8000-000000000001',
  'CCI-REG-16', 'confirmed', now()
);
insert into public.attendance (registration_id, status, marked_at) values (
  '78000000-0000-4000-8000-000000000001', 'attended', now()
);
insert into public.certificates (
  id, person_id, template_id, registration_id, certificate_type, certificate_code,
  participant_name_snapshot, title_snapshot, file_path, access_token
) values (
  '77000000-0000-4000-8000-000000000001',
  '39000000-0000-4000-8000-000000000001',
  'c5000000-0000-4000-8000-000000000001',
  '78000000-0000-4000-8000-000000000001',
  'activity', 'CCI-CERT-16', 'Nombre Incorrecto', 'Actividad Regeneración',
  'issued/77000000-0000-4000-8000-000000000001/old.pdf',
  '76000000-0000-4000-8000-000000000001'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '89000000-0000-4000-8000-000000000001', true);
select throws_ok(
  $$select public.replace_certificate_document('77000000-0000-4000-8000-000000000001', '39000000-0000-4000-8000-000000000001', 'Nombre Correcto', 'issued/77000000-0000-4000-8000-000000000001/old.pdf', 'issued/77000000-0000-4000-8000-000000000001/new.pdf')$$,
  '42501', 'UNAUTHORIZED', 'students cannot regenerate certificates'
);

select set_config('request.jwt.claim.sub', '89000000-0000-4000-8000-000000000002', true);
select lives_ok(
  $$select public.replace_certificate_document('77000000-0000-4000-8000-000000000001', '39000000-0000-4000-8000-000000000001', 'Nombre Correcto', 'issued/77000000-0000-4000-8000-000000000001/old.pdf', 'issued/77000000-0000-4000-8000-000000000001/new.pdf')$$,
  'operators can replace an issued certificate document'
);
select is(
  (select participant_name_snapshot from public.certificates where id = '77000000-0000-4000-8000-000000000001'),
  'Nombre Correcto', 'replacement updates only the intended name snapshot'
);
select is(
  (select file_path from public.certificates where id = '77000000-0000-4000-8000-000000000001'),
  'issued/77000000-0000-4000-8000-000000000001/new.pdf', 'replacement points to the new private file'
);
select is(
  (select certificate_code from public.certificates where id = '77000000-0000-4000-8000-000000000001'),
  'CCI-CERT-16', 'replacement preserves the certificate code'
);
select is(
  (select access_token from public.certificates where id = '77000000-0000-4000-8000-000000000001'),
  '76000000-0000-4000-8000-000000000001'::uuid, 'replacement preserves the public token'
);
select is(
  (select count(*) from public.audit_logs where action = 'certificate.regenerated' and entity_id = '77000000-0000-4000-8000-000000000001'),
  1::bigint, 'replacement is audited'
);
select is(
  (select count(*) from public.notification_outbox where related_entity_id = '77000000-0000-4000-8000-000000000001'),
  0::bigint, 'replacement creates no email notification'
);
select throws_ok(
  $$select public.replace_certificate_document('77000000-0000-4000-8000-000000000001', '39000000-0000-4000-8000-000000000001', 'Nombre Correcto', 'issued/77000000-0000-4000-8000-000000000001/old.pdf', 'issued/77000000-0000-4000-8000-000000000001/again.pdf')$$,
  '40001', 'CERTIFICATE_FILE_CHANGED', 'stale replacements cannot overwrite a concurrent change'
);

select is(
  (select total_count from public.get_certificate_activity_summaries('Actividad', null, 1, 0) limit 1),
  2::bigint, 'activity summaries return the filtered total before pagination'
);
select is(
  (select count(*) from public.get_certificate_activity_summaries('Actividad', null, 1, 0)),
  1::bigint, 'activity summaries honor the requested page size'
);
select is(
  (select total_count from public.get_activity_certificate_candidates('79000000-0000-4000-8000-000000000001', 'Nombre Correcto', 20, 0) limit 1),
  1::bigint, 'candidate search finds a participant by full name'
);

select public.revoke_certificate('77000000-0000-4000-8000-000000000001', 'Prueba de revocación');
select throws_ok(
  $$select public.replace_certificate_document('77000000-0000-4000-8000-000000000001', '39000000-0000-4000-8000-000000000001', 'Nombre Correcto', 'issued/77000000-0000-4000-8000-000000000001/new.pdf', 'issued/77000000-0000-4000-8000-000000000001/revoked.pdf')$$,
  'P0001', 'CERTIFICATE_NOT_ISSUED', 'revoked certificates cannot be regenerated'
);

reset role;
select * from finish(true);
rollback;
