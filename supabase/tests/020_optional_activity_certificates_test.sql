begin;

select plan(47);

select ok(
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'activities' and column_name = 'certificate_mode'
  ),
  'activities stores the certificate mode'
);
select ok(
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'registrations' and column_name = 'certificate_request_token'
  ),
  'registrations store an opaque request token'
);
select ok(
  exists (select 1 from pg_indexes where indexname = 'uq_registrations_certificate_request_token'),
  'certificate request tokens are unique'
);
select ok(
  to_regprocedure('public.request_activity_certificate(text,uuid)') is not null,
  'public certificate request RPC exists'
);
select ok(
  to_regprocedure('public.mark_certificate_request_followed_up(uuid)') is not null,
  'administrative follow-up RPC exists'
);
select is(
  has_function_privilege('anon', 'public.mark_certificate_request_followed_up(uuid)', 'EXECUTE'),
  false,
  'anonymous users cannot execute administrative follow-up'
);

insert into public.activities (
  id, type, title, slug, description, modality, is_free, status
) values (
  '7e000000-0000-4000-8000-000000000003', 'event', 'Sin certificado Hito 14',
  'sin-certificado-hito-14', 'Actividad temporal sin certificado.', 'virtual', true, 'draft'
);

select is(
  (select certificate_mode from public.activities where id = '7e000000-0000-4000-8000-000000000003'),
  'none',
  'certificate mode defaults to none'
);
select is(
  (select certificate_general_price from public.activities where id = '7e000000-0000-4000-8000-000000000003'),
  0::numeric,
  'certificate prices default to zero'
);
select throws_ok(
  $$insert into public.activities (
    id, type, title, slug, description, modality, is_free, certificate_mode, status
  ) values (
    '7e000000-0000-4000-8000-000000000098', 'event', 'Modalidad inválida',
    'modalidad-invalida-hito-14', 'Modalidad inválida para la prueba.', 'virtual', true,
    'automatic', 'draft'
  )$$,
  '23514',
  null,
  'unknown certificate modes are rejected'
);
select throws_ok(
  $$insert into public.activities (
    id, type, title, slug, description, modality, is_free,
    certificate_mode, certificate_general_price, certificate_member_price, status
  ) values (
    '7e000000-0000-4000-8000-000000000097', 'event', 'Tarifa opcional inválida',
    'tarifa-opcional-invalida-hito-14', 'Tarifa opcional inválida para la prueba.',
    'virtual', true, 'optional_paid', 0, 0, 'draft'
  )$$,
  '23514',
  null,
  'optional certificate prices must be greater than zero'
);
select throws_ok(
  $$insert into public.activities (
    id, type, title, slug, description, modality, is_free,
    certificate_mode, certificate_general_price, certificate_member_price, status
  ) values (
    '7e000000-0000-4000-8000-000000000096', 'event', 'Tarifa de asociado inválida',
    'tarifa-asociado-invalida-hito-14', 'Tarifa de asociado inválida para la prueba.',
    'virtual', true, 'optional_paid', 30, 40, 'draft'
  )$$,
  '23514',
  null,
  'member certificate price cannot exceed the general price'
);

insert into auth.users (id, email)
values
  ('8e000000-0000-4000-8000-000000000001', 'hito14.student@example.test'),
  ('8e000000-0000-4000-8000-000000000002', 'hito14.admin@example.test');

insert into public.people (
  id, document_type, document_number, first_names, last_names, email, phone, job_title
)
values
  ('3e000000-0000-4000-8000-000000000001', 'dni', '14000001', 'Estudiante', 'Hito Catorce', 'hito14.student@example.test', '914000001', 'Estudiante'),
  ('3e000000-0000-4000-8000-000000000002', 'dni', '14000002', 'Administrador', 'Hito Catorce', 'hito14.admin@example.test', '914000002', 'Administrador');

insert into public.user_accounts (user_id, person_id, role)
values
  ('8e000000-0000-4000-8000-000000000001', '3e000000-0000-4000-8000-000000000001', 'student'),
  ('8e000000-0000-4000-8000-000000000002', '3e000000-0000-4000-8000-000000000002', 'administrator');

insert into public.activity_contacts (
  id, label, contact_name, whatsapp_phone, email
) values (
  'ae000000-0000-4000-8000-000000000001',
  'Responsable Hito 14',
  'Responsable Certificados',
  '914000014',
  'certificados.hito14@example.test'
);

update public.activities
set
  contact_id = 'ae000000-0000-4000-8000-000000000001',
  published_at = now(),
  status = 'published'
where id = '7e000000-0000-4000-8000-000000000003';

insert into public.activities (
  id, contact_id, type, title, slug, description, modality, is_free,
  certificate_mode, certificate_general_price, certificate_member_price,
  status, published_at
)
values
  (
    '7e000000-0000-4000-8000-000000000001',
    'ae000000-0000-4000-8000-000000000001',
    'event', 'Certificado opcional Hito 14', 'certificado-opcional-hito-14',
    'Actividad temporal con certificado opcional.', 'virtual', true,
    'optional_paid', 50, 35, 'published', now()
  ),
  (
    '7e000000-0000-4000-8000-000000000002',
    'ae000000-0000-4000-8000-000000000001',
    'training', 'Certificado incluido Hito 14', 'certificado-incluido-hito-14',
    'Actividad temporal con certificado incluido.', 'virtual', true,
    'included', 0, 0, 'published', now()
  );

insert into public.activity_dates (activity_id, starts_at, ends_at, sort_order)
values
  ('7e000000-0000-4000-8000-000000000001', now() + interval '1 day', now() + interval '1 day 2 hours', 0),
  ('7e000000-0000-4000-8000-000000000002', now() + interval '1 day', now() + interval '1 day 2 hours', 0),
  ('7e000000-0000-4000-8000-000000000003', now() + interval '1 day', now() + interval '1 day 2 hours', 0);

select throws_ok(
  $$insert into public.activities (
    id, type, title, slug, description, modality, is_free,
    certificate_mode, certificate_general_price, certificate_member_price, status
  ) values (
    '7e000000-0000-4000-8000-000000000099', 'event', 'Configuración inválida',
    'configuracion-invalida-hito-14', 'Configuración inválida para la prueba.',
    'virtual', true, 'included', 20, 0, 'draft'
  )$$,
  '23514',
  null,
  'included certificates reject additional prices'
);

set local role anon;
select public.register_activity(
  '7e000000-0000-4000-8000-000000000001',
  '{"document_type":"dni","document_number":"14000003","first_names":"Participante","last_names":"Opcional General","email":"opcional.general@example.test","phone":"914000003","job_title":"Analista","registration_type":"general"}'::jsonb
);
select public.register_activity(
  '7e000000-0000-4000-8000-000000000001',
  '{"document_type":"dni","document_number":"14000004","first_names":"Participante","last_names":"Opcional Asociado","email":"opcional.asociado@example.test","phone":"914000004","job_title":"Gerente","company":"Empresa Hito 14","ruc":"20140000004","registration_type":"member"}'::jsonb
);
select public.register_activity(
  '7e000000-0000-4000-8000-000000000002',
  '{"document_type":"dni","document_number":"14000005","first_names":"Participante","last_names":"Certificado Incluido","email":"incluido@example.test","phone":"914000005","job_title":"Contador","registration_type":"general"}'::jsonb
);
select public.register_activity(
  '7e000000-0000-4000-8000-000000000003',
  '{"document_type":"dni","document_number":"14000006","first_names":"Participante","last_names":"Sin Certificado","email":"sin.certificado@example.test","phone":"914000006","job_title":"Abogado","registration_type":"general"}'::jsonb
);
reset role;

create temporary table hito14_refs as
select
  attendance.id as attendance_id,
  people.document_number,
  registration.certificate_request_token,
  registration.certificate_mode_snapshot,
  registration.certificate_price_snapshot,
  registration.id as registration_id,
  registration.registration_code
from public.registrations registration
join public.people people on people.id = registration.person_id
join public.attendance attendance on attendance.registration_id = registration.id
where registration.activity_id in (
  '7e000000-0000-4000-8000-000000000001',
  '7e000000-0000-4000-8000-000000000002',
  '7e000000-0000-4000-8000-000000000003'
);

grant select on hito14_refs to anon, authenticated;

select is(
  (select certificate_mode_snapshot from public.registrations where id = (select registration_id from hito14_refs where document_number = '14000003')),
  'optional_paid',
  'general registration snapshots the optional certificate mode'
);
select is(
  (select certificate_price_snapshot from public.registrations where id = (select registration_id from hito14_refs where document_number = '14000003')),
  50::numeric,
  'general registration snapshots the general certificate price'
);
select is(
  (select certificate_price_snapshot from public.registrations where id = (select registration_id from hito14_refs where document_number = '14000004')),
  35::numeric,
  'member registration snapshots the member certificate price'
);
select is(
  (select certificate_mode_snapshot from public.registrations where id = (select registration_id from hito14_refs where document_number = '14000005')),
  'included',
  'included certificate mode is snapshotted'
);
select is(
  (select certificate_price_snapshot from public.registrations where id = (select registration_id from hito14_refs where document_number = '14000005')),
  null::numeric,
  'included certificate has no separate price'
);
select is(
  (select certificate_mode_snapshot from hito14_refs where document_number = '14000006'),
  'none',
  'none mode is snapshotted'
);
select is(
  (select certificate_price_snapshot from hito14_refs where document_number = '14000006'),
  null::numeric,
  'none mode snapshots no certificate price'
);

update public.activities
set certificate_general_price = 70, certificate_member_price = 45
where id = '7e000000-0000-4000-8000-000000000001';

select is(
  (select certificate_price_snapshot from public.registrations where id = (select registration_id from hito14_refs where document_number = '14000003')),
  50::numeric,
  'later price changes preserve the general snapshot'
);
select is(
  (select certificate_price_snapshot from public.registrations where id = (select registration_id from hito14_refs where document_number = '14000004')),
  35::numeric,
  'later price changes preserve the member snapshot'
);

update public.activities
set certificate_mode = 'optional_paid', certificate_general_price = 40, certificate_member_price = 30
where id = '7e000000-0000-4000-8000-000000000003';

select is(
  (select certificate_mode_snapshot from public.registrations where id = (select registration_id from hito14_refs where document_number = '14000006')),
  'optional_paid',
  'first certificate configuration backfills registrations that still have none'
);
select is(
  (select certificate_price_snapshot from public.registrations where id = (select registration_id from hito14_refs where document_number = '14000006')),
  40::numeric,
  'controlled backfill selects the applicable historical registration type price'
);
select is(
  (select count(*) from public.audit_logs
    where action = 'activity.certificate_configuration_changed'
      and entity_id = '7e000000-0000-4000-8000-000000000003'),
  1::bigint,
  'certificate configuration and its backfill are audited'
);

create temporary table hito14_request_time (requested_at timestamptz);
grant select on hito14_request_time to anon;

set local role anon;
select throws_ok(
  $$select public.request_activity_certificate(
    (select registration_code from hito14_refs where document_number = '14000003'),
    '00000000-0000-4000-8000-000000000000'::uuid
  )$$,
  'P0001',
  'CERTIFICATE_REQUEST_NOT_FOUND',
  'invalid request token is rejected'
);
select lives_ok(
  $$select public.request_activity_certificate(
    (select registration_code from hito14_refs where document_number = '14000003'),
    (select certificate_request_token from hito14_refs where document_number = '14000003')
  )$$,
  'confirmed participant requests the optional certificate'
);
reset role;

insert into hito14_request_time
select certificate_requested_at from public.registrations
where id = (select registration_id from hito14_refs where document_number = '14000003');

select ok(
  (select requested_at is not null from hito14_request_time),
  'request persists before WhatsApp context is returned'
);
select is(
  (select count(*) from public.audit_logs where action = 'registration.certificate_requested'
    and entity_id = (select registration_id from hito14_refs where document_number = '14000003')),
  1::bigint,
  'certificate request is audited once'
);
select is(
  (select count(*) from public.notification_outbox where event_type = 'activity_certificate_request_created'
    and related_entity_id = (select registration_id from hito14_refs where document_number = '14000003')),
  1::bigint,
  'certificate request prepares one internal notification'
);

set local role anon;
select lives_ok(
  $$select public.request_activity_certificate(
    (select registration_code from hito14_refs where document_number = '14000003'),
    (select certificate_request_token from hito14_refs where document_number = '14000003')
  )$$,
  'repeated request is idempotent'
);
select throws_ok(
  $$select public.request_activity_certificate(
    (select registration_code from hito14_refs where document_number = '14000005'),
    (select certificate_request_token from hito14_refs where document_number = '14000005')
  )$$,
  'P0001',
  'CERTIFICATE_REQUEST_NOT_AVAILABLE',
  'included certificates do not accept commercial requests'
);
reset role;

select is(
  (select certificate_requested_at from public.registrations where id = (select registration_id from hito14_refs where document_number = '14000003')),
  (select requested_at from hito14_request_time),
  'repeated request preserves the first timestamp'
);
select is(
  (select count(*) from public.notification_outbox where event_type = 'activity_certificate_request_created'
    and related_entity_id = (select registration_id from hito14_refs where document_number = '14000003')),
  1::bigint,
  'repeated request does not duplicate the internal notification'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '8e000000-0000-4000-8000-000000000001', true);
select throws_ok(
  $$select public.mark_certificate_request_followed_up(
    (select registration_id from hito14_refs where document_number = '14000003')
  )$$,
  '42501',
  'UNAUTHORIZED',
  'student cannot mark certificate follow-up'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '8e000000-0000-4000-8000-000000000002', true);
select throws_ok(
  $$select public.mark_certificate_request_followed_up(
    (select registration_id from hito14_refs where document_number = '14000004')
  )$$,
  'P0001',
  'CERTIFICATE_REQUEST_NOT_FOUND',
  'follow-up is rejected when no request exists'
);
select lives_ok(
  $$select public.mark_certificate_request_followed_up(
    (select registration_id from hito14_refs where document_number = '14000003')
  )$$,
  'administrator marks the request as attended'
);
select ok(
  (select certificate_followed_up_at is not null
    and certificate_followed_up_by = '8e000000-0000-4000-8000-000000000002'::uuid
    from public.registrations where id = (select registration_id from hito14_refs where document_number = '14000003')),
  'follow-up records timestamp and actor'
);
select is(
  (select count(*) from public.audit_logs where action = 'registration.certificate_followed_up'
    and entity_id = (select registration_id from hito14_refs where document_number = '14000003')),
  1::bigint,
  'follow-up is audited'
);

select lives_ok(
  $$select public.set_attendance_status(
    array[(select attendance_id from hito14_refs where document_number = '14000004')],
    'attended',
    null
  )$$,
  'attendance can trigger an optional certificate offer'
);
select is(
  (select count(*) from public.notification_outbox where event_type = 'activity_certificate_offer'
    and related_entity_id = (select registration_id from hito14_refs where document_number = '14000004')),
  1::bigint,
  'attendance enqueues one optional certificate offer'
);
select lives_ok(
  $$select public.set_attendance_status(
    array[(select attendance_id from hito14_refs where document_number = '14000004')],
    'absent',
    null
  )$$,
  'attendance can be corrected after the offer'
);
select lives_ok(
  $$select public.set_attendance_status(
    array[(select attendance_id from hito14_refs where document_number = '14000004')],
    'attended',
    null
  )$$,
  'participant can be marked attended again'
);
select is(
  (select count(*) from public.notification_outbox where event_type = 'activity_certificate_offer'
    and related_entity_id = (select registration_id from hito14_refs where document_number = '14000004')),
  1::bigint,
  'repeated attended transitions do not duplicate the offer'
);
select lives_ok(
  $$select public.set_attendance_status(
    array[(select attendance_id from hito14_refs where document_number = '14000003')],
    'attended',
    null
  )$$,
  'requester can be marked attended'
);
select is(
  (select count(*) from public.notification_outbox where event_type = 'activity_certificate_offer'
    and related_entity_id = (select registration_id from hito14_refs where document_number = '14000003')),
  0::bigint,
  'participants who already requested do not receive the later offer'
);
select lives_ok(
  $$select public.set_attendance_status(
    array[(select attendance_id from hito14_refs where document_number = '14000005')],
    'attended',
    null
  )$$,
  'included certificate participant can be marked attended'
);
select is(
  (select count(*) from public.notification_outbox where event_type = 'activity_certificate_offer'
    and related_entity_id = (select registration_id from hito14_refs where document_number = '14000005')),
  0::bigint,
  'included certificate never creates a commercial offer'
);
reset role;

select * from finish(true);

rollback;
