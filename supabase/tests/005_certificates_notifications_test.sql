begin;

select plan(73);

select ok(to_regtype('public.certificate_type') is not null, 'certificate type exists');
select ok(to_regtype('public.certificate_status') is not null, 'certificate status exists');
select ok(to_regclass('public.certificate_templates') is not null, 'certificate templates table exists');
select ok(to_regclass('public.certificate_template_signers') is not null, 'certificate signers table exists');
select ok(to_regclass('public.certificates') is not null, 'certificates table exists');
select ok((select relrowsecurity from pg_class where oid = 'public.certificate_templates'::regclass), 'template RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.certificate_template_signers'::regclass), 'signer RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.certificates'::regclass), 'certificate RLS enabled');
select ok(exists (select 1 from pg_indexes where indexname = 'uq_certificate_template_default_active'), 'unique default template index exists');
select ok(exists (select 1 from pg_indexes where indexname = 'uq_certificates_registration_active'), 'unique registration certificate index exists');
select ok(exists (select 1 from pg_indexes where indexname = 'idx_certificates_person'), 'certificate person index exists');
select ok(exists (select 1 from pg_indexes where indexname = 'idx_certificates_code'), 'certificate code index exists');
select is((select public from storage.buckets where id = 'certificates'), false, 'certificate bucket is private');
select is((select file_size_limit from storage.buckets where id = 'certificates'), 10485760::bigint, 'certificate bucket has size limit');
select is(has_table_privilege('anon', 'public.certificates', 'SELECT'), false, 'anonymous cannot enumerate certificates');
select is(has_table_privilege('authenticated', 'public.certificates', 'INSERT'), false, 'authenticated users cannot insert certificates directly');
select is(has_function_privilege('anon', 'public.get_public_certificate(text)', 'EXECUTE'), true, 'anonymous can resolve a certificate token');
select is(has_function_privilege('anon', 'public.get_public_certificate_file(text)', 'EXECUTE'), false, 'anonymous cannot resolve private storage paths');
select is(has_function_privilege('anon', 'public.prepare_activity_certificates(uuid[],uuid,text)', 'EXECUTE'), false, 'anonymous cannot prepare certificates');
select is(has_function_privilege('authenticated', 'public.prepare_activity_certificates(uuid[],uuid,text)', 'EXECUTE'), true, 'authenticated role can reach guarded preparation RPC');
select is(has_function_privilege('authenticated', 'public.claim_notification_batch(integer)', 'EXECUTE'), false, 'authenticated users cannot claim notification jobs');
select is((select count(*) from public.certificate_templates where id = 'c5000000-0000-4000-8000-000000000001' and is_default and is_active), 1::bigint, 'default activity template seeded');
select is((select signer_name from public.certificate_template_signers where id = 'c5100000-0000-4000-8000-000000000001'), 'Eduardo Ojeda Davila', 'default signer seeded');

insert into auth.users (id, email)
values
  ('85000000-0000-4000-8000-000000000001', 'hito5.student@example.test'),
  ('85000000-0000-4000-8000-000000000002', 'hito5.admin@example.test');

insert into public.people (
  id, document_type, document_number, first_names, last_names, email, phone, job_title
) values
  ('35000000-0000-4000-8000-000000000001', 'dni', '15000001', 'Estudiante', 'Hito Cinco', 'hito5.student@example.test', '915000001', 'Estudiante'),
  ('35000000-0000-4000-8000-000000000002', 'dni', '15000002', 'Administrador', 'Hito Cinco', 'hito5.admin@example.test', '915000002', 'Administrador');

insert into public.user_accounts (user_id, person_id, role)
values
  ('85000000-0000-4000-8000-000000000001', '35000000-0000-4000-8000-000000000001', 'student'),
  ('85000000-0000-4000-8000-000000000002', '35000000-0000-4000-8000-000000000002', 'administrator');

insert into public.activities (
  id, type, title, slug, description, modality, academic_hours, is_free,
  general_price, member_price, capacity, registration_open_at,
  registration_close_at, maps_embed_url, contact_phone, status, published_at
) values (
  '75000000-0000-4000-8000-000000000001', 'training', 'Capacitación Certificable',
  'capacitacion-certificable-hito-5', 'Actividad temporal para pruebas.', 'in_person',
  8, false, 120, 80, 20, now() - interval '1 day', now() + interval '1 day',
  'https://www.google.com/maps/embed?pb=hito5', '900000005',
  'published', now()
);

insert into public.activity_dates (id, activity_id, starts_at, ends_at)
values ('76000000-0000-4000-8000-000000000001', '75000000-0000-4000-8000-000000000001', '2026-09-10 09:00:00-05', '2026-09-10 17:00:00-05');

set local role anon;
select public.register_activity(
  '75000000-0000-4000-8000-000000000001',
  '{"document_type":"dni","document_number":"15000003","first_names":"Asistente","last_names":"Certificable Uno","email":"certificable1@example.test","phone":"915000003","job_title":"Gerente","registration_type":"general"}'::jsonb
);
select public.register_activity(
  '75000000-0000-4000-8000-000000000001',
  '{"document_type":"dni","document_number":"15000004","first_names":"Ausente","last_names":"Certificable Dos","email":"certificable2@example.test","phone":"915000004","job_title":"Analista","registration_type":"general"}'::jsonb
);
reset role;

create temporary table hito5_refs as
select registrations.id as registration_id, attendance.id as attendance_id, people.document_number
from public.registrations
join public.people on people.id = registrations.person_id
join public.attendance on attendance.registration_id = registrations.id
where registrations.activity_id = '75000000-0000-4000-8000-000000000001';
grant select on hito5_refs to authenticated;

set local role authenticated;
select set_config('request.jwt.claim.sub', '85000000-0000-4000-8000-000000000001', true);
select throws_ok(
  $$select public.prepare_activity_certificates(array[(select registration_id from hito5_refs limit 1)], 'c5000000-0000-4000-8000-000000000001', 'Participó')$$,
  '42501', 'UNAUTHORIZED', 'student cannot prepare certificates'
);
select throws_ok(
  $$select public.save_certificate_template('{"name":"No autorizado","scope":"activity"}'::jsonb, '[{"signer_name":"Firmante"}]'::jsonb)$$,
  '42501', 'UNAUTHORIZED', 'student cannot save templates'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '85000000-0000-4000-8000-000000000002', true);

select lives_ok(
  $$select public.prepare_activity_certificates(array[(select registration_id from hito5_refs where document_number = '15000003')], 'c5000000-0000-4000-8000-000000000001', 'Participó')$$,
  'preparation handles a pending registration'
);
select is((select count(*) from public.certificates where registration_id = (select registration_id from hito5_refs where document_number = '15000003')), 0::bigint, 'pending registration receives no certificate');

select public.confirm_registration((select registration_id from hito5_refs where document_number = '15000003'));
select public.confirm_registration((select registration_id from hito5_refs where document_number = '15000004'));
select public.set_attendance_status(array[(select attendance_id from hito5_refs where document_number = '15000004')], 'absent', null);

select lives_ok(
  $$select public.prepare_activity_certificates(array[(select registration_id from hito5_refs where document_number = '15000004')], 'c5000000-0000-4000-8000-000000000001', 'Participó')$$,
  'preparation handles an absent participant'
);
select is((select count(*) from public.certificates where registration_id = (select registration_id from hito5_refs where document_number = '15000004')), 0::bigint, 'absent participant receives no certificate');

select public.set_attendance_status(array[(select attendance_id from hito5_refs where document_number = '15000003')], 'attended', 'Asistencia validada');
select lives_ok(
  $$select public.prepare_activity_certificates(array[(select registration_id from hito5_refs where document_number = '15000003')], 'c5000000-0000-4000-8000-000000000001', 'Culminó')$$,
  'eligible participant certificate is prepared'
);
select is((select count(*) from public.certificates where registration_id = (select registration_id from hito5_refs where document_number = '15000003') and deleted_at is null), 1::bigint, 'one certificate is prepared');
select ok((select certificate_code like 'CCI-CERT-2026-%' from public.certificates where registration_id = (select registration_id from hito5_refs where document_number = '15000003')), 'certificate code has institutional format');
select ok((select access_token is not null from public.certificates where registration_id = (select registration_id from hito5_refs where document_number = '15000003')), 'certificate receives access token');
select is((select participant_name_snapshot from public.certificates where registration_id = (select registration_id from hito5_refs where document_number = '15000003')), 'Asistente Certificable Uno', 'participant name snapshot stored');
select is((select title_snapshot from public.certificates where registration_id = (select registration_id from hito5_refs where document_number = '15000003')), 'Capacitación Certificable', 'title snapshot stored');
select is((select condition_snapshot from public.certificates where registration_id = (select registration_id from hito5_refs where document_number = '15000003')), 'Culminó', 'condition snapshot stored');
select is((select date_text_snapshot from public.certificates where registration_id = (select registration_id from hito5_refs where document_number = '15000003')), '10/09/2026', 'date text snapshot stored');
select is((select academic_hours_snapshot from public.certificates where registration_id = (select registration_id from hito5_refs where document_number = '15000003')), 8::numeric, 'academic hours snapshot stored');
select ok((select file_path is null from public.certificates where registration_id = (select registration_id from hito5_refs where document_number = '15000003')), 'file remains pending until generation');

select lives_ok(
  $$select public.prepare_activity_certificates(array[(select registration_id from hito5_refs where document_number = '15000003')], 'c5000000-0000-4000-8000-000000000001', 'Culminó')$$,
  'repeated preparation is idempotent'
);
select is((select count(*) from public.certificates where registration_id = (select registration_id from hito5_refs where document_number = '15000003') and deleted_at is null), 1::bigint, 'repeated preparation creates no duplicate');

create temporary table hito5_certificate as
select id, access_token, certificate_code from public.certificates
where registration_id = (select registration_id from hito5_refs where document_number = '15000003');
grant select on hito5_certificate to authenticated, anon, service_role;

reset role;
update public.people set first_names = 'Nombre Cambiado' where document_number = '15000003';
update public.activities set title = 'Título Cambiado' where id = '75000000-0000-4000-8000-000000000001';
select is((select participant_name_snapshot from public.certificates where id = (select id from hito5_certificate)), 'Asistente Certificable Uno', 'person changes preserve certificate snapshot');
select is((select title_snapshot from public.certificates where id = (select id from hito5_certificate)), 'Capacitación Certificable', 'activity changes preserve certificate snapshot');

set local role authenticated;
select set_config('request.jwt.claim.sub', '85000000-0000-4000-8000-000000000002', true);
select lives_ok(
  $$select public.finalize_activity_certificate((select id from hito5_certificate), 'issued/hito5-test.pdf', 'https://eventos.camaraica.org.pe')$$,
  'generated certificate is finalized'
);
select is((select file_path from public.certificates where id = (select id from hito5_certificate)), 'issued/hito5-test.pdf', 'finalization stores file path');
select is((select count(*) from public.notification_outbox where event_type = 'activity_certificate_issued' and related_entity_id = (select id from hito5_certificate)), 1::bigint, 'finalization creates certificate notification');
select is((select count(*) from public.audit_logs where action = 'certificate.issued' and entity_id = (select id from hito5_certificate)), 1::bigint, 'issuance is audited');
select lives_ok(
  $$select public.finalize_activity_certificate((select id from hito5_certificate), 'issued/other.pdf', 'https://eventos.camaraica.org.pe')$$,
  'repeated finalization is idempotent'
);
select is((select file_path from public.certificates where id = (select id from hito5_certificate)), 'issued/hito5-test.pdf', 'repeated finalization preserves original file');
select is((select count(*) from public.notification_outbox where event_type = 'activity_certificate_issued' and related_entity_id = (select id from hito5_certificate)), 1::bigint, 'repeated finalization creates no notification duplicate');

reset role;
set local role anon;
select ok(public.get_public_certificate((select access_token::text from hito5_certificate)) is not null, 'public token resolves certificate');
select is(public.get_public_certificate((select access_token::text from hito5_certificate))->>'certificate_code', (select certificate_code::text from hito5_certificate), 'public token returns correct certificate');
select is(public.get_public_certificate(gen_random_uuid()::text), null::jsonb, 'random token reveals nothing');

reset role;
set local role service_role;
select is(public.get_public_certificate_file((select access_token::text from hito5_certificate)), 'issued/hito5-test.pdf', 'service worker resolves downloadable private path');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '85000000-0000-4000-8000-000000000002', true);
select lives_ok(
  $$select public.revoke_certificate((select id from hito5_certificate), 'Corrección institucional requerida')$$,
  'administrator revokes certificate'
);
select is((select status from public.certificates where id = (select id from hito5_certificate)), 'revoked'::public.certificate_status, 'revocation persists status');
select ok((select revoked_at is not null and revoked_by = '85000000-0000-4000-8000-000000000002'::uuid from public.certificates where id = (select id from hito5_certificate)), 'revocation stores timestamp and actor');
select is((select revocation_reason from public.certificates where id = (select id from hito5_certificate)), 'Corrección institucional requerida', 'revocation stores reason');
select ok((select deleted_at is null from public.certificates where id = (select id from hito5_certificate)), 'revocation is not soft deletion');
select is((select count(*) from public.audit_logs where action = 'certificate.revoked' and entity_id = (select id from hito5_certificate)), 1::bigint, 'revocation is audited');

reset role;
set local role anon;
select is(public.get_public_certificate((select access_token::text from hito5_certificate))->>'status', 'revoked', 'public page sees revoked status');

reset role;
set local role service_role;
select is(public.get_public_certificate_file((select access_token::text from hito5_certificate)), null::text, 'revoked certificate file is not downloadable');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '85000000-0000-4000-8000-000000000002', true);
select lives_ok(
  $$select public.save_certificate_template(
    '{"name":"Plantilla secundaria","scope":"activity","is_default":false,"is_active":true,"template_config":{"show_date":false}}'::jsonb,
    '[{"signer_name":"Eduardo Ojeda Davila","signer_title":"Presidente Institucional","sort_order":0}]'::jsonb
  )$$,
  'administrator creates certificate template'
);
select is((select count(*) from public.certificate_templates where name = 'Plantilla secundaria' and deleted_at is null), 1::bigint, 'template persists');
select is((select count(*) from public.certificate_template_signers where template_id = (select id from public.certificate_templates where name = 'Plantilla secundaria') and deleted_at is null), 1::bigint, 'template signer persists');
select is((select count(*) from public.audit_logs where action = 'certificate_template.created' and entity_id = (select id from public.certificate_templates where name = 'Plantilla secundaria')), 1::bigint, 'template creation is audited');

reset role;
update public.notification_outbox set next_attempt_at = now() + interval '1 year'
where status in ('pending', 'failed') and deleted_at is null;
insert into public.notification_outbox (
  id, event_type, recipient_email, related_entity_type, related_entity_id
) values (
  '95000000-0000-4000-8000-000000000001', 'hito5_delivery_test', 'delivery@example.test', 'test', '95000000-0000-4000-8000-000000000002'
);

reset role;
set local role service_role;
select lives_ok($$select public.claim_notification_batch(10)$$, 'service role claims notification jobs');
select is((select status from public.notification_outbox where id = '95000000-0000-4000-8000-000000000001'), 'processing'::public.notification_status, 'claimed notification is processing');
select is((select attempts from public.notification_outbox where id = '95000000-0000-4000-8000-000000000001'), 1, 'claim increments attempts');
select lives_ok($$select public.complete_notification_delivery('95000000-0000-4000-8000-000000000001', false, 'Proveedor no disponible')$$, 'worker records provider failure');
select is((select status from public.notification_outbox where id = '95000000-0000-4000-8000-000000000001'), 'failed'::public.notification_status, 'provider failure persists failed status');
select is((select last_error from public.notification_outbox where id = '95000000-0000-4000-8000-000000000001'), 'Proveedor no disponible', 'provider error is recorded');
select ok((select next_attempt_at is not null from public.notification_outbox where id = '95000000-0000-4000-8000-000000000001'), 'provider failure schedules retry');

reset role;

select * from finish(true);

rollback;
