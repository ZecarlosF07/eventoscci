begin;

select plan(34);

select ok(exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'activities' and column_name = 'is_listed'), 'activities have independent listing visibility');
select ok(to_regclass('public.member_companies') is not null, 'member-company roster exists');
select ok(to_regclass('public.member_group_requests') is not null, 'group requests exist');
select ok(to_regclass('public.member_group_payments') is not null, 'payment audit records exist');
select ok(to_regclass('public.member_group_payment_allocations') is not null, 'payments allocate to individual seats');

insert into public.member_companies(ruc, legal_name) values ('20123456789', 'Empresa Asociada de Prueba');
insert into public.activities (
  id, type, title, slug, description, modality, is_free, general_price,
  member_price, members_only, is_listed, capacity, registration_open_at,
  registration_close_at, maps_embed_url, contact_phone, status, published_at
) values
  ('25000000-0000-4000-8000-000000000001', 'event', 'Evento exclusivo pagado', 'evento-exclusivo-pagado', 'Prueba.', 'in_person', false, 80, 40, true, false, 3, now() - interval '1 day', now() + interval '1 day', 'https://www.google.com/maps/embed?pb=member-paid', '900000001', 'published', now()),
  ('25000000-0000-4000-8000-000000000002', 'event', 'Evento exclusivo gratuito', 'evento-exclusivo-gratuito', 'Prueba.', 'in_person', true, 0, 0, true, true, 3, now() - interval '1 day', now() + interval '1 day', 'https://www.google.com/maps/embed?pb=member-free', '900000002', 'published', now()),
  ('25000000-0000-4000-8000-000000000003', 'event', 'Evento histórico normal', 'evento-historico-normal', 'Prueba.', 'in_person', true, 0, 0, false, true, 3, now() - interval '1 day', now() + interval '1 day', 'https://www.google.com/maps/embed?pb=member-old', '900000003', 'published', now());

select is((select is_listed from public.activities where id = '25000000-0000-4000-8000-000000000001'), false, 'paid event can be published without listing');

insert into auth.users (id, email) values
  ('25000000-0000-4000-8000-000000000040', 'admin25@example.test');
insert into public.people (
  id, document_type, document_number, first_names, last_names, email, phone, job_title
) values (
  '25000000-0000-4000-8000-000000000041', 'dni', '25100041', 'Admin', 'Pruebas',
  'admin25@example.test', '925000041', 'Administradora'
);
insert into public.user_accounts(user_id, person_id, role) values
  ('25000000-0000-4000-8000-000000000040', '25000000-0000-4000-8000-000000000041', 'administrator');

set local role anon;
select throws_ok(
  $$select public.register_activity('25000000-0000-4000-8000-000000000001', '{"document_type":"dni","document_number":"25100001","first_names":"Persona","last_names":"Individual","email":"individual@example.test","phone":"925000001","participant_profile":"professional","job_title":"Gerente","company":"Empresa Asociada de Prueba","ruc":"20123456789","registration_type":"member"}'::jsonb)$$,
  'P0001', 'EXCLUSIVE_EVENT_REQUIRES_GROUP', 'old individual RPC cannot bypass the roster and group flow'
);
select throws_ok(
  $$select public.register_member_group('25000000-0000-4000-8000-000000000001', '{"ruc":"20999999999","billing":{"type":"factura","document":"20999999999","name":"Otra Empresa","address":"Calle Uno"},"attendees":[{"document_type":"dni","document_number":"25100001","first_names":"Ana","last_names":"Prueba","email":"ana@example.test","phone":"925000001","job_title":"Gerente","request_certificate":false}]}'::jsonb, '25000000-0000-4000-8000-000000000010')$$,
  'P0001', 'MEMBER_RUC_INACTIVE', 'inactive RUC cannot submit'
);
select lives_ok(
  $$select public.register_member_group('25000000-0000-4000-8000-000000000001', '{"ruc":"20123456789","billing":{"type":"factura","document":"20999999999","name":"Otra Empresa","address":"Calle Uno"},"attendees":[{"document_type":"dni","document_number":"25100001","first_names":"Ana","last_names":"Prueba","email":"ana@example.test","phone":"925000001","job_title":"Gerente","request_certificate":false},{"document_type":"dni","document_number":"25100002","first_names":"Bea","last_names":"Prueba","email":"bea@example.test","phone":"925000002","job_title":"Gerente","request_certificate":false}]}'::jsonb, '25000000-0000-4000-8000-000000000011')$$,
  'two people register atomically with an alternate billing RUC'
);
reset role;

select is((select count(*) from public.registrations where activity_id = '25000000-0000-4000-8000-000000000001'), 2::bigint, 'group creates two individual seats');
select is((select sum(price_snapshot) from public.registrations where activity_id = '25000000-0000-4000-8000-000000000001'), 80::numeric, 'member price is frozen per seat');
select is((select billing_document from public.member_group_requests where activity_id = '25000000-0000-4000-8000-000000000001'), '20999999999', 'billing RUC can differ from member RUC');
select is((select count(*) from public.attendance where registration_id in (select id from public.registrations where activity_id = '25000000-0000-4000-8000-000000000001')), 2::bigint, 'each attendee receives an attendance record');

set local role anon;
select lives_ok(
  $$select public.register_member_group('25000000-0000-4000-8000-000000000001', '{"ruc":"20123456789","billing":{"type":"factura","document":"20999999999","name":"Otra Empresa","address":"Calle Uno"},"attendees":[{"document_type":"dni","document_number":"25100001","first_names":"Ana","last_names":"Prueba","email":"ana@example.test","phone":"925000001","job_title":"Gerente","request_certificate":false},{"document_type":"dni","document_number":"25100002","first_names":"Bea","last_names":"Prueba","email":"bea@example.test","phone":"925000002","job_title":"Gerente","request_certificate":false}]}'::jsonb, '25000000-0000-4000-8000-000000000011')$$,
  'retry with the same idempotency key returns the original group'
);
reset role;
select is((select count(*) from public.member_group_requests where activity_id = '25000000-0000-4000-8000-000000000001'), 1::bigint, 'retry does not duplicate the group');

set local role authenticated;
select set_config('request.jwt.claim.sub', '25000000-0000-4000-8000-000000000040', true);
select throws_ok(
  $$select public.confirm_registration((select id from public.registrations where activity_id = '25000000-0000-4000-8000-000000000001' order by registration_code limit 1))$$,
  'P0001', 'GROUP_CONFIRMATION_REQUIRES_PAYMENT_OPERATION', 'old confirmation RPC cannot confirm an unpaid group seat'
);
select throws_ok(
  $$select public.verify_member_group_payment((select id from public.member_group_requests where activity_id = '25000000-0000-4000-8000-000000000001'), array(select id from public.registrations where activity_id = '25000000-0000-4000-8000-000000000001' order by registration_code limit 1), 'Transferencia 123', 39, null, '25000000-0000-4000-8000-000000000016')$$,
  'P0001', 'PAYMENT_AMOUNT_MISMATCH', 'received amount must equal selected seat prices'
);
select lives_ok(
  $$select public.verify_member_group_payment((select id from public.member_group_requests where activity_id = '25000000-0000-4000-8000-000000000001'), array(select id from public.registrations where activity_id = '25000000-0000-4000-8000-000000000001' order by registration_code limit 1), 'Transferencia 123', 40, null, '25000000-0000-4000-8000-000000000012')$$,
  'one selected seat can be paid and confirmed'
);
select lives_ok(
  $$select public.verify_member_group_payment((select id from public.member_group_requests where activity_id = '25000000-0000-4000-8000-000000000001'), array(select id from public.registrations where activity_id = '25000000-0000-4000-8000-000000000001' order by registration_code limit 1), 'Transferencia 123', 40, null, '25000000-0000-4000-8000-000000000012')$$,
  'retrying the same payment returns its original result'
);
reset role;
select is((select count(*) from public.registrations where activity_id = '25000000-0000-4000-8000-000000000001' and status = 'confirmed'), 1::bigint, 'partial payment confirms only one seat');
select is((select sum(amount) from public.member_group_payments), 40::numeric, 'payment amount equals selected seat price');
select is((select count(*) from public.member_group_payments), 1::bigint, 'payment retry does not create another payment');

set local role authenticated;
select set_config('request.jwt.claim.sub', '25000000-0000-4000-8000-000000000040', true);
select throws_ok(
  $$select public.cancel_registration((select id from public.registrations where activity_id = '25000000-0000-4000-8000-000000000001' and status = 'confirmed'))$$,
  'P0001', 'PAID_GROUP_SEAT_CANNOT_CANCEL', 'paid confirmed seat cannot be cancelled normally'
);
select lives_ok(
  $$select public.cancel_registration((select id from public.registrations where activity_id = '25000000-0000-4000-8000-000000000001' and status = 'pending'), 'Pago no realizado')$$,
  'pending unpaid seat can be cancelled manually'
);
reset role;
select is((select count(*) from public.registrations where activity_id = '25000000-0000-4000-8000-000000000001' and status = 'cancelled'), 1::bigint, 'cancelled seat is released');

set local role anon;
select lives_ok(
  $$select public.register_member_group('25000000-0000-4000-8000-000000000001', '{"ruc":"20123456789","billing":{"type":"boleta","document":"25100002","name":"Bea Prueba"},"attendees":[{"document_type":"dni","document_number":"25100002","first_names":"Bea","last_names":"Prueba","email":"bea@example.test","phone":"925000002","job_title":"Gerente","request_certificate":false}]}'::jsonb, '25000000-0000-4000-8000-000000000014')$$,
  'same RUC may create another request and a cancelled person may register again'
);
reset role;
select is((select count(*) from public.member_group_requests where activity_id = '25000000-0000-4000-8000-000000000001'), 2::bigint, 'same company now has two requests for one event');

set local role anon;
select throws_ok(
  $$select public.register_member_group('25000000-0000-4000-8000-000000000001', '{"ruc":"20123456789","billing":{"type":"boleta","document":"25100004","name":"Dina Prueba"},"attendees":[{"document_type":"dni","document_number":"25100004","first_names":"Dina","last_names":"Prueba","email":"dina@example.test","phone":"925000004","job_title":"Gerente","request_certificate":false},{"document_type":"dni","document_number":"25100005","first_names":"Eva","last_names":"Prueba","email":"eva@example.test","phone":"925000005","job_title":"Gerente","request_certificate":false}]}'::jsonb, '25000000-0000-4000-8000-000000000015')$$,
  'P0001', 'NO_AVAILABLE_CAPACITY', 'the entire group is rejected when only one seat remains'
);
reset role;
select is((select count(*) from public.people where document_number in ('25100004', '25100005')), 0::bigint, 'failed group did not create partial people');

insert into public.people (
  id, document_type, document_number, first_names, last_names, email, phone, job_title
) values (
  '25000000-0000-4000-8000-000000000030', 'dni', '25100003', 'Carla', 'Anterior',
  'carla@example.test', '925000003', 'Gerente'
);
insert into public.registrations(activity_id, person_id, registration_code, registration_type, job_title_snapshot, price_snapshot)
values ('25000000-0000-4000-8000-000000000003', '25000000-0000-4000-8000-000000000030', 'CCI-HIST-25100003', 'general', 'Gerente', 0);

set local role anon;
select lives_ok(
  $$select public.register_member_group('25000000-0000-4000-8000-000000000002', '{"ruc":"20123456789","billing":null,"attendees":[{"document_type":"dni","document_number":"25100003","first_names":"Carla","last_names":"Prueba","email":"carla@example.test","phone":"925000003","job_title":"Gerente","request_certificate":false}]}'::jsonb, '25000000-0000-4000-8000-000000000013')$$,
  'free exclusive event confirms immediately without billing'
);
reset role;
select is((select status from public.registrations where activity_id = '25000000-0000-4000-8000-000000000002'), 'confirmed'::public.registration_status, 'free seat is confirmed');
select is((select last_names from public.people where id = '25000000-0000-4000-8000-000000000030'), 'Prueba', 'name change is applied after successful group registration');
select is((select last_names_snapshot from public.registrations where activity_id = '25000000-0000-4000-8000-000000000003'), 'Anterior', 'historical registration preserves its name snapshot');
select is((select count(*) from public.audit_logs where action = 'participant.name_updated_by_member_group' and entity_id = '25000000-0000-4000-8000-000000000030'), 1::bigint, 'name change keeps an audit record');

select * from finish(true);
rollback;
