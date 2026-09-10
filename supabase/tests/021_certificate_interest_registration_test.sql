begin;

select plan(12);

insert into public.activity_contacts (
  id, label, contact_name, whatsapp_phone, email
) values (
  'ae000000-0000-4000-8000-000000000021',
  'Responsable interés certificado',
  'Responsable Hito 14',
  '914000021',
  'certificados.21@example.test'
);

insert into public.activities (
  id, contact_id, type, title, slug, description, modality, is_free,
  general_price, member_price, certificate_mode,
  certificate_general_price, certificate_member_price, status, published_at
) values
  (
    '7e000000-0000-4000-8000-000000000021',
    'ae000000-0000-4000-8000-000000000021',
    'event', 'Interés gratuito Hito 14', 'interes-gratuito-hito-14',
    'Actividad gratuita para probar el interés por certificado.', 'virtual', true,
    0, 0, 'optional_paid', 50, 35, 'published', now()
  ),
  (
    '7e000000-0000-4000-8000-000000000022',
    'ae000000-0000-4000-8000-000000000021',
    'training', 'Interés pagado Hito 14', 'interes-pagado-hito-14',
    'Actividad pagada para probar el interés por certificado.', 'virtual', false,
    100, 80, 'optional_paid', 45, 30, 'published', now()
  ),
  (
    '7e000000-0000-4000-8000-000000000023',
    'ae000000-0000-4000-8000-000000000021',
    'event', 'Certificado incluido Hito 14', 'incluido-sin-interes-hito-14',
    'Actividad incluida para ignorar solicitudes comerciales.', 'virtual', true,
    0, 0, 'included', 0, 0, 'published', now()
  );

insert into public.activity_dates (activity_id, starts_at, ends_at, sort_order)
values
  ('7e000000-0000-4000-8000-000000000021', now() + interval '1 day', now() + interval '1 day 2 hours', 0),
  ('7e000000-0000-4000-8000-000000000022', now() + interval '1 day', now() + interval '1 day 2 hours', 0),
  ('7e000000-0000-4000-8000-000000000023', now() + interval '1 day', now() + interval '1 day 2 hours', 0);

create temporary table hito14_interest_results (payload jsonb);
grant select, insert on hito14_interest_results to anon;

set local role anon;
insert into hito14_interest_results
select public.register_activity(
  '7e000000-0000-4000-8000-000000000021',
  '{"document_type":"dni","document_number":"14000021","first_names":"Interés","last_names":"Gratuito","email":"interes.gratuito@example.test","phone":"914000021","job_title":"Analista","registration_type":"general","request_certificate":true}'::jsonb
);
insert into hito14_interest_results
select public.register_activity(
  '7e000000-0000-4000-8000-000000000022',
  '{"document_type":"dni","document_number":"14000022","first_names":"Interés","last_names":"Pagado","email":"interes.pagado@example.test","phone":"914000022","job_title":"Gerente","registration_type":"general","request_certificate":true}'::jsonb
);
insert into hito14_interest_results
select public.register_activity(
  '7e000000-0000-4000-8000-000000000021',
  '{"document_type":"dni","document_number":"14000023","first_names":"Sin","last_names":"Solicitud","email":"sin.solicitud@example.test","phone":"914000023","job_title":"Contador","registration_type":"general","request_certificate":false}'::jsonb
);
insert into hito14_interest_results
select public.register_activity(
  '7e000000-0000-4000-8000-000000000023',
  '{"document_type":"dni","document_number":"14000024","first_names":"Certificado","last_names":"Incluido","email":"incluido.21@example.test","phone":"914000024","job_title":"Abogado","registration_type":"general","request_certificate":true}'::jsonb
);
reset role;

select is(
  (select status from public.registrations where registration_code = (
    select payload->>'registration_code' from hito14_interest_results where payload->>'activity_id' = '7e000000-0000-4000-8000-000000000021' and payload->>'certificate_requested_at' is not null
  )),
  'confirmed'::public.registration_status,
  'free registration remains confirmed when certificate interest is selected'
);
select ok(
  exists (select 1 from hito14_interest_results where payload->>'activity_id' = '7e000000-0000-4000-8000-000000000021' and payload->>'certificate_requested_at' is not null),
  'free registration returns the persisted certificate request timestamp'
);
select is(
  (select status from public.registrations where registration_code = (
    select payload->>'registration_code' from hito14_interest_results where payload->>'activity_id' = '7e000000-0000-4000-8000-000000000022'
  )),
  'pending'::public.registration_status,
  'paid participation remains pending when certificate interest is selected'
);
select ok(
  exists (select 1 from hito14_interest_results where payload->>'activity_id' = '7e000000-0000-4000-8000-000000000022' and payload->>'certificate_requested_at' is not null),
  'pending preregistration preserves certificate interest'
);
select ok(
  exists (select 1 from hito14_interest_results where payload->>'activity_id' = '7e000000-0000-4000-8000-000000000021' and payload->>'certificate_requested_at' is null),
  'unchecked optional certificate remains unrequested'
);
select is(
  (select count(*) from public.notification_outbox where event_type = 'activity_certificate_request_created' and related_entity_id in (
    select (payload->>'registration_id')::uuid from hito14_interest_results
  )),
  2::bigint,
  'selected interests enqueue one internal notification each'
);
select is(
  (select count(*) from public.audit_logs where action = 'registration.certificate_requested' and entity_id in (
    select (payload->>'registration_id')::uuid from hito14_interest_results
  )),
  2::bigint,
  'selected interests are audited'
);
select ok(
  (select (payload->>'certificate_request_notification_id')::uuid is not null from hito14_interest_results where payload->>'activity_id' = '7e000000-0000-4000-8000-000000000022'),
  'registration result returns the internal notification identifier'
);
select is(
  (select payload->>'certificate_requested' from public.notification_outbox where event_type = 'activity_free_registration_confirmed' and related_entity_id = (
    select (payload->>'registration_id')::uuid from hito14_interest_results where payload->>'activity_id' = '7e000000-0000-4000-8000-000000000021' and payload->>'certificate_requested_at' is not null
  )),
  'true',
  'free confirmation payload identifies interest selected during registration'
);
select is(
  (select payload->>'certificate_requested' from public.notification_outbox where event_type = 'activity_paid_preregistration_created' and related_entity_id = (
    select (payload->>'registration_id')::uuid from hito14_interest_results where payload->>'activity_id' = '7e000000-0000-4000-8000-000000000022'
  )),
  'true',
  'paid preregistration payload identifies certificate interest'
);
select ok(
  (select payload->>'certificate_requested_at' is null from hito14_interest_results where payload->>'activity_id' = '7e000000-0000-4000-8000-000000000023'),
  'included certificates ignore commercial request input'
);
select ok(
  (select payload->>'certificate_request_notification_id' is null from hito14_interest_results where payload->>'activity_id' = '7e000000-0000-4000-8000-000000000023'),
  'included certificates do not enqueue internal commercial notifications'
);

select * from finish(true);

rollback;
