begin;

select plan(30);

select ok(exists (select 1 from information_schema.columns
  where table_schema = 'public' and table_name = 'activities'
    and column_name = 'member_free_passes_per_company'), 'activity has a company pass quota');
select ok(to_regclass('public.member_complimentary_passes') is not null,
  'pass assignment ledger exists');

insert into public.member_companies(ruc, legal_name)
values ('20666666661', 'Empresa de Pases');
insert into public.activities (
  id, type, title, slug, description, modality, is_free, general_price,
  member_price, members_only, is_listed, capacity, registration_open_at,
  registration_close_at, maps_embed_url, contact_phone, status, published_at,
  payment_note, member_free_passes_per_company
) values (
  '27000000-0000-4000-8000-000000000001', 'event', 'Evento con pases',
  'evento-con-pases', 'Evento para verificar pases gratuitos.', 'in_person',
  false, 0, 40, true, false, 10, now() - interval '1 day',
  now() + interval '1 day', 'https://www.google.com/maps/embed?pb=passes',
  '900000001', 'published', now(), 'Coordina el pago con la CCI.', 1
);

insert into auth.users(id, email) values
  ('27000000-0000-4000-8000-000000000040', 'admin27@example.test');
insert into public.people(id, document_type, document_number,
  first_names, last_names, email, phone, job_title)
values ('27000000-0000-4000-8000-000000000041', 'dni', '27100041',
  'Admin', 'Pases', 'admin27@example.test', '927000041', 'Administradora');
insert into public.user_accounts(user_id, person_id, role) values
  ('27000000-0000-4000-8000-000000000040',
   '27000000-0000-4000-8000-000000000041', 'administrator');

set local role anon;
select lives_ok($$select public.register_member_group(
  '27000000-0000-4000-8000-000000000001',
  '{"ruc":"20666666661","expected_free_count":1,"billing":{"type":"boleta","document":"27100001","name":"Ana Pases"},"attendees":[{"document_type":"dni","document_number":"27100001","first_names":"Ana","last_names":"Pases","email":"ana27@example.test","phone":"927000001","job_title":"Gerente","request_certificate":false},{"document_type":"dni","document_number":"27100002","first_names":"Bea","last_names":"Pases","email":"bea27@example.test","phone":"927000002","job_title":"Gerente","request_certificate":false}]}',
  '27000000-0000-4000-8000-000000000011')$$,
  'mixed group creates one complimentary and one paid seat');
reset role;
select is((select count(*) from public.member_complimentary_passes
  where activity_id = '27000000-0000-4000-8000-000000000001'), 1::bigint,
  'one pass is consumed for the RUC');
select is((select status from public.registrations
  where activity_id = '27000000-0000-4000-8000-000000000001'
  order by registration_code limit 1), 'confirmed'::public.registration_status,
  'the first attendee is confirmed');
select is((select price_snapshot from public.registrations
  where activity_id = '27000000-0000-4000-8000-000000000001'
  order by registration_code limit 1), 0::numeric,
  'complimentary seat has a frozen zero price');
select is((select price_snapshot from public.registrations
  where activity_id = '27000000-0000-4000-8000-000000000001'
  order by registration_code offset 1 limit 1), 40::numeric,
  'second seat keeps the associated price');
select is((select count(*) from public.audit_logs
  where action = 'member_group.complimentary_pass_assigned'), 1::bigint,
  'initial pass assignment is audited');
select is((select count(*) from public.notification_outbox
  where event_type = 'activity_free_registration_confirmed'
    and related_entity_id = (select id from public.registrations
      where activity_id = '27000000-0000-4000-8000-000000000001'
      order by registration_code limit 1)), 1::bigint,
  'free attendee has one immediate confirmation');

set local role anon;
select throws_ok($$select public.register_member_group(
  '27000000-0000-4000-8000-000000000001',
  '{"ruc":"20666666661","expected_free_count":1,"billing":{"type":"boleta","document":"27100003","name":"Carla Pases"},"attendees":[{"document_type":"dni","document_number":"27100003","first_names":"Carla","last_names":"Pases","email":"carla27@example.test","phone":"927000003","job_title":"Gerente","request_certificate":false}]}',
  '27000000-0000-4000-8000-000000000013')$$,
  'P0001', 'BENEFIT_AVAILABILITY_CHANGED',
  'stale preview is rejected before a higher price is charged');
select lives_ok($$select public.register_member_group(
  '27000000-0000-4000-8000-000000000001',
  '{"ruc":"20666666661","expected_free_count":0,"billing":{"type":"boleta","document":"27100003","name":"Carla Pases"},"attendees":[{"document_type":"dni","document_number":"27100003","first_names":"Carla","last_names":"Pases","email":"carla27@example.test","phone":"927000003","job_title":"Gerente","request_certificate":false}]}',
  '27000000-0000-4000-8000-000000000013')$$,
  'later request for the same RUC receives no extra pass');
select lives_ok($$select public.register_member_group(
  '27000000-0000-4000-8000-000000000001',
  '{"ruc":"20666666661","expected_free_count":0,"billing":{"type":"boleta","document":"27100003","name":"Carla Pases"},"attendees":[{"document_type":"dni","document_number":"27100003","first_names":"Carla","last_names":"Pases","email":"carla27@example.test","phone":"927000003","job_title":"Gerente","request_certificate":false}]}',
  '27000000-0000-4000-8000-000000000013')$$,
  'retry does not create another group or pass');
reset role;
select is((select count(*) from public.member_complimentary_passes
  where activity_id = '27000000-0000-4000-8000-000000000001'), 1::bigint,
  'second request and retry leave the quota unchanged');
select is((select count(*) from public.member_group_requests
  where activity_id = '27000000-0000-4000-8000-000000000001'), 2::bigint,
  'retry does not duplicate a group request');

set local role authenticated;
select set_config('request.jwt.claim.sub',
  '27000000-0000-4000-8000-000000000040', true);
select throws_ok($$select public.verify_member_group_payment(
  (select member_group_request_id from public.registrations
    where activity_id = '27000000-0000-4000-8000-000000000001'
    order by registration_code limit 1),
  array(select id from public.registrations
    where activity_id = '27000000-0000-4000-8000-000000000001'
    order by registration_code limit 1),
  'Pago no válido', 40, null, '27000000-0000-4000-8000-000000000014')$$,
  'P0001', 'INVALID_PAYMENT_SELECTION',
  'payment validation rejects a complimentary seat');
select lives_ok($$select public.cancel_registration(
  (select id from public.registrations
    where activity_id = '27000000-0000-4000-8000-000000000001'
    order by registration_code limit 1), 'No podrá asistir')$$,
  'unused complimentary seat can be cancelled by the administrator');
reset role;
select is((select count(*) from public.member_complimentary_passes
  where activity_id = '27000000-0000-4000-8000-000000000001'), 1::bigint,
  'cancellation does not replenish the pass');
select is((select count(*) from public.notification_outbox
  where event_type = 'activity_registration_cancelled'), 1::bigint,
  'cancelled complimentary attendee has one notice');

set local role authenticated;
select set_config('request.jwt.claim.sub',
  '27000000-0000-4000-8000-000000000040', true);
select lives_ok($$select public.transfer_member_complimentary_pass(
  (select id from public.member_complimentary_passes
    where activity_id = '27000000-0000-4000-8000-000000000001'),
  (select id from public.registrations
    where activity_id = '27000000-0000-4000-8000-000000000001'
      and status = 'pending' order by registration_code limit 1),
  'Asistente de reemplazo')$$,
  'pass transfers to an unpaid seat of the same RUC');
select throws_ok($$select public.transfer_member_complimentary_pass(
  (select id from public.member_complimentary_passes
    where activity_id = '27000000-0000-4000-8000-000000000001'),
  (select registration.id from public.registrations registration
    join public.people person on person.id = registration.person_id
    where person.document_number = '27100003'),
  'Transferencia repetida')$$,
  'P0001', 'PASS_TRANSFER_NOT_ALLOWED',
  'the same pass cannot transfer again without cancelling its current holder');
reset role;
select is((select count(*) from public.audit_logs
  where action = 'member_group.complimentary_pass_transferred'), 1::bigint,
  'transfer includes a reasoned audit record');
select is((select count(*) from public.registrations
  where activity_id = '27000000-0000-4000-8000-000000000001'
    and status = 'confirmed' and is_complimentary), 1::bigint,
  'transfer confirms only the receiver');
select is((select sum(price_snapshot) from public.registrations
  where activity_id = '27000000-0000-4000-8000-000000000001'
    and status <> 'cancelled'), 40::numeric,
  'the remaining active seats have the correct charge after transfer');
select throws_ok($$update public.activities
  set member_free_passes_per_company = 0
  where id = '27000000-0000-4000-8000-000000000001'$$,
  'P0001', 'MEMBER_FREE_PASSES_LOCKED',
  'quota cannot decrease after registrations');
select lives_ok($$update public.activities
  set member_free_passes_per_company = 2
  where id = '27000000-0000-4000-8000-000000000001'$$,
  'quota can increase after registrations');
set local role anon;
select lives_ok($$select public.register_member_group(
  '27000000-0000-4000-8000-000000000001',
  '{"ruc":"20666666661","expected_free_count":1,"billing":null,"attendees":[{"document_type":"dni","document_number":"27100004","first_names":"Dina","last_names":"Pases","email":"dina27@example.test","phone":"927000004","job_title":"Gerente","request_certificate":false}]}',
  '27000000-0000-4000-8000-000000000015')$$,
  'a new pass confirms a zero-cost request without billing');
reset role;
select is((select billing_type from public.member_group_requests request
  join public.registrations registration on registration.member_group_request_id = request.id
  join public.people person on person.id = registration.person_id
  where person.document_number = '27100004'), null::text,
  'zero-cost paid-event request stores no billing data');
select is((select status from public.registrations registration
  join public.people person on person.id = registration.person_id
  where person.document_number = '27100004'),
  'confirmed'::public.registration_status,
  'new complimentary attendee is confirmed immediately');
select is((select sum(registration.price_snapshot)
  from public.registrations registration
  join public.people person on person.id = registration.person_id
  where person.document_number = '27100004'), 0::numeric,
  'zero-cost request has no participation charge');
set local role authenticated;
select set_config('request.jwt.claim.sub',
  '27000000-0000-4000-8000-000000000040', true);
select is((public.list_member_group_requests(null,
  '27000000-0000-4000-8000-000000000001', null, 1, 20)
  ->'items'->0->>'complimentary_used')::integer, 2,
  'admin list shows total passes used across all requests for the RUC');
reset role;

select * from finish(true);
rollback;
