begin;

select plan(34);

select has_column('public', 'registrations', 'certificate_requested_by', 'manual request actor exists');
select has_column('public', 'registrations', 'certificate_payment_verified_at', 'payment verification date exists');
select has_column('public', 'registrations', 'certificate_payment_verified_by', 'payment verification actor exists');
select is(has_function_privilege('anon', 'public.register_activity_certificate_request_admin(uuid)', 'EXECUTE'), false, 'anonymous users cannot register manual requests');
select is(has_function_privilege('authenticated', 'public.verify_activity_certificate_payment(uuid)', 'EXECUTE'), true, 'authenticated users can invoke the protected payment RPC');

insert into auth.users (id, email) values
  ('8a230000-0000-4000-8000-000000000001', 'admin23@example.test'),
  ('8a230000-0000-4000-8000-000000000002', 'student23@example.test');

insert into public.people (
  id, document_type, document_number, first_names, last_names, email, phone, job_title
) values
  ('3a230000-0000-4000-8000-000000000001', 'dni', '23000001', 'Admin', 'Certificados', 'admin23@example.test', '923000001', 'Administradora'),
  ('3a230000-0000-4000-8000-000000000002', 'dni', '23000002', 'Alumno', 'Certificados', 'student23@example.test', '923000002', 'Analista'),
  ('3a230000-0000-4000-8000-000000000011', 'dni', '23000011', 'Persona', 'Confirmada', 'confirmed23@example.test', '923000011', 'Analista'),
  ('3a230000-0000-4000-8000-000000000012', 'dni', '23000012', 'Persona', 'Pendiente', 'pending23@example.test', '923000012', 'Analista'),
  ('3a230000-0000-4000-8000-000000000013', 'dni', '23000013', 'Persona', 'Incluida', 'included23@example.test', '923000013', 'Analista'),
  ('3a230000-0000-4000-8000-000000000014', 'dni', '23000014', 'Persona', 'Cancelada', 'cancelled23@example.test', '923000014', 'Analista'),
  ('3a230000-0000-4000-8000-000000000015', 'dni', '23000015', 'Persona', 'Archivada', 'archived23@example.test', '923000015', 'Analista');

insert into public.user_accounts (user_id, person_id, role) values
  ('8a230000-0000-4000-8000-000000000001', '3a230000-0000-4000-8000-000000000001', 'administrator'),
  ('8a230000-0000-4000-8000-000000000002', '3a230000-0000-4000-8000-000000000002', 'student');

insert into public.activities (
  id, type, title, slug, description, modality, is_free, general_price,
  member_price, certificate_mode, certificate_general_price,
  certificate_member_price, maps_embed_url, contact_phone, status, published_at
) values
  ('7a230000-0000-4000-8000-000000000001', 'training', 'Certificado opcional', 'certificado-opcional-23', 'Prueba de pago manual.', 'in_person', true, 0, 0, 'optional_paid', 40, 30, 'https://www.google.com/maps/embed?pb=test', '999999999', 'published', now()),
  ('7a230000-0000-4000-8000-000000000002', 'training', 'Certificado incluido', 'certificado-incluido-23', 'Prueba de certificado incluido.', 'in_person', true, 0, 0, 'included', 0, 0, 'https://www.google.com/maps/embed?pb=test', '999999999', 'published', now()),
  ('7a230000-0000-4000-8000-000000000003', 'training', 'Actividad archivada', 'actividad-archivada-23', 'Prueba de actividad archivada.', 'in_person', true, 0, 0, 'optional_paid', 40, 30, 'https://www.google.com/maps/embed?pb=test', '999999999', 'published', now());

insert into public.registrations (
  id, activity_id, person_id, registration_code, registration_type, status, confirmed_at, cancelled_at
) values
  ('6a230000-0000-4000-8000-000000000011', '7a230000-0000-4000-8000-000000000001', '3a230000-0000-4000-8000-000000000011', 'CCI-23-000011', 'general', 'confirmed', now(), null),
  ('6a230000-0000-4000-8000-000000000012', '7a230000-0000-4000-8000-000000000001', '3a230000-0000-4000-8000-000000000012', 'CCI-23-000012', 'general', 'pending', null, null),
  ('6a230000-0000-4000-8000-000000000013', '7a230000-0000-4000-8000-000000000002', '3a230000-0000-4000-8000-000000000013', 'CCI-23-000013', 'general', 'confirmed', now(), null),
  ('6a230000-0000-4000-8000-000000000014', '7a230000-0000-4000-8000-000000000001', '3a230000-0000-4000-8000-000000000014', 'CCI-23-000014', 'general', 'cancelled', null, now()),
  ('6a230000-0000-4000-8000-000000000015', '7a230000-0000-4000-8000-000000000003', '3a230000-0000-4000-8000-000000000015', 'CCI-23-000015', 'general', 'confirmed', now(), null);

insert into public.attendance (id, registration_id, status) values
  ('5a230000-0000-4000-8000-000000000011', '6a230000-0000-4000-8000-000000000011', 'pending'),
  ('5a230000-0000-4000-8000-000000000012', '6a230000-0000-4000-8000-000000000012', 'pending'),
  ('5a230000-0000-4000-8000-000000000013', '6a230000-0000-4000-8000-000000000013', 'pending'),
  ('5a230000-0000-4000-8000-000000000014', '6a230000-0000-4000-8000-000000000014', 'pending'),
  ('5a230000-0000-4000-8000-000000000015', '6a230000-0000-4000-8000-000000000015', 'pending');

update public.activities
set status = 'archived'
where id = '7a230000-0000-4000-8000-000000000003';

set local role authenticated;
select set_config('request.jwt.claim.sub', '8a230000-0000-4000-8000-000000000002', true);
select throws_ok(
  $$select public.register_activity_certificate_request_admin('6a230000-0000-4000-8000-000000000011')$$,
  '42501', 'UNAUTHORIZED', 'students cannot register certificate requests'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '8a230000-0000-4000-8000-000000000001', true);
select lives_ok(
  $$select public.register_activity_certificate_request_admin('6a230000-0000-4000-8000-000000000011')$$,
  'an administrator registers a request received outside the platform'
);
select ok(
  (select certificate_requested_at is not null and certificate_requested_by = '8a230000-0000-4000-8000-000000000001'
   from public.registrations where id = '6a230000-0000-4000-8000-000000000011'),
  'manual request stores its date and actor'
);
select is(
  (select count(*) from public.notification_outbox where related_entity_id = '6a230000-0000-4000-8000-000000000011' and event_type = 'activity_certificate_request_created'),
  0::bigint, 'manual request does not enqueue a duplicate internal notification'
);
select is(
  (select count(*) from public.audit_logs where entity_id = '6a230000-0000-4000-8000-000000000011' and action = 'registration.certificate_requested'),
  1::bigint, 'manual request is audited'
);
select lives_ok(
  $$select public.register_activity_certificate_request_admin('6a230000-0000-4000-8000-000000000011')$$,
  'repeated manual request is idempotent'
);
select is(
  (select count(*) from public.audit_logs where entity_id = '6a230000-0000-4000-8000-000000000011' and action = 'registration.certificate_requested'),
  1::bigint, 'idempotent request does not duplicate audit'
);

select lives_ok(
  $$select public.register_activity_certificate_request_admin('6a230000-0000-4000-8000-000000000012')$$,
  'a pending preregistration can preserve certificate interest'
);
select throws_ok(
  $$select public.verify_activity_certificate_payment('6a230000-0000-4000-8000-000000000012')$$,
  'P0001', 'REGISTRATION_NOT_CONFIRMED', 'payment cannot be verified before registration confirmation'
);
select lives_ok(
  $$select public.verify_activity_certificate_payment('6a230000-0000-4000-8000-000000000011')$$,
  'administrator verifies an external payment'
);
select ok(
  (select certificate_payment_verified_at is not null and certificate_payment_verified_by = '8a230000-0000-4000-8000-000000000001'
   from public.registrations where id = '6a230000-0000-4000-8000-000000000011'),
  'payment verification stores its date and actor'
);
select is(
  (select count(*) from public.audit_logs where entity_id = '6a230000-0000-4000-8000-000000000011' and action = 'registration.certificate_payment_verified'),
  1::bigint, 'payment verification is audited'
);
select lives_ok(
  $$select public.verify_activity_certificate_payment('6a230000-0000-4000-8000-000000000011')$$,
  'repeated payment verification is idempotent'
);
select is(
  (select count(*) from public.audit_logs where entity_id = '6a230000-0000-4000-8000-000000000011' and action = 'registration.certificate_payment_verified'),
  1::bigint, 'idempotent payment verification does not duplicate audit'
);

select throws_ok(
  $$select public.revert_activity_certificate_payment('6a230000-0000-4000-8000-000000000011', ' ')$$,
  '22023', 'INVALID_REVERSAL_REASON', 'payment reversal requires a reason'
);
select lives_ok(
  $$select public.revert_activity_certificate_payment('6a230000-0000-4000-8000-000000000011', 'Comprobante asociado por error')$$,
  'payment verification can be reverted with a reason'
);
select ok(
  (select certificate_payment_verified_at is null and certificate_payment_verified_by is null
   from public.registrations where id = '6a230000-0000-4000-8000-000000000011'),
  'reversal returns the request to payment pending'
);
select is(
  (select metadata->>'reason' from public.audit_logs where entity_id = '6a230000-0000-4000-8000-000000000011' and action = 'registration.certificate_payment_reverted'),
  'Comprobante asociado por error', 'reversal audit preserves its reason'
);
select lives_ok(
  $$select public.revert_activity_certificate_payment('6a230000-0000-4000-8000-000000000011', 'Segundo intento')$$,
  'repeated reversal is idempotent'
);

select throws_ok(
  $$select public.register_activity_certificate_request_admin('6a230000-0000-4000-8000-000000000013')$$,
  'P0001', 'CERTIFICATE_REQUEST_NOT_AVAILABLE', 'included certificates reject commercial requests'
);
select throws_ok(
  $$select public.register_activity_certificate_request_admin('6a230000-0000-4000-8000-000000000014')$$,
  'P0001', 'REGISTRATION_CANCELLED', 'cancelled registrations reject certificate requests'
);
select throws_ok(
  $$select public.register_activity_certificate_request_admin('6a230000-0000-4000-8000-000000000015')$$,
  'P0001', 'ACTIVITY_NOT_AVAILABLE', 'archived activities reject certificate requests'
);

select lives_ok(
  $$select public.verify_activity_certificate_payment('6a230000-0000-4000-8000-000000000011')$$,
  'payment can be verified again after a valid reversal'
);
select lives_ok(
  $$select public.set_attendance_status(
    array[
      '5a230000-0000-4000-8000-000000000011'::uuid,
      '5a230000-0000-4000-8000-000000000013'::uuid
    ],
    'attended',
    null
  )$$,
  'attendance makes paid optional and included certificates ready'
);

select is(
  (select certificate_payment_verified_at is not null from public.get_activity_certificate_candidates('7a230000-0000-4000-8000-000000000001', null, 20, 0) where registration_id = '6a230000-0000-4000-8000-000000000011'),
  true, 'certificate candidate query exposes verified payment state'
);
select is(
  (select eligible_count from public.get_certificate_activity_summaries(null, null, 12, 0) where id = '7a230000-0000-4000-8000-000000000001'),
  1::bigint, 'optional certificate is counted ready after payment and attendance'
);
select is(
  (select eligible_count from public.get_certificate_activity_summaries(null, null, 12, 0) where id = '7a230000-0000-4000-8000-000000000002'),
  1::bigint, 'included certificate is ready with attendance and no payment'
);

reset role;

insert into public.certificate_templates (id, name, scope, is_active, is_default)
values ('4a230000-0000-4000-8000-000000000001', 'Plantilla Hito 14 ampliado', 'activity', true, false);
insert into public.certificates (
  id, person_id, template_id, registration_id, certificate_type, certificate_code,
  participant_name_snapshot, title_snapshot, issued_by
) values (
  '2a230000-0000-4000-8000-000000000001',
  '3a230000-0000-4000-8000-000000000011',
  '4a230000-0000-4000-8000-000000000001',
  '6a230000-0000-4000-8000-000000000011',
  'activity', 'CCI-CERT-2026-230001', 'Persona Confirmada', 'Certificado opcional',
  '8a230000-0000-4000-8000-000000000001'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '8a230000-0000-4000-8000-000000000001', true);
select throws_ok(
  $$select public.revert_activity_certificate_payment('6a230000-0000-4000-8000-000000000011', 'No debe permitirse')$$,
  'P0001', 'CERTIFICATE_ALREADY_ISSUED', 'issued certificates block payment reversal'
);
select is(
  (select certificate_payment_verified_at is not null from public.registrations where id = '6a230000-0000-4000-8000-000000000011'),
  true, 'blocked reversal preserves verified payment'
);

reset role;

select * from finish();
rollback;
