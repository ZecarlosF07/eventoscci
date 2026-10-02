begin;
select no_plan();
select is(has_function_privilege('anon','public.register_activity_priced(uuid,jsonb,numeric)','EXECUTE'),false,'priced individual core is private');
select is(has_function_privilege('service_role','public.register_member_group_priced(uuid,jsonb,uuid,numeric)','EXECUTE'),false,'priced group core cannot be invoked directly');
select is(has_function_privilege('authenticated','public.save_activity_without_presale(jsonb,jsonb,jsonb)','EXECUTE'),false,'old admin save cannot bypass presale');

insert into auth.users(id,email) values ('36000000-0000-4000-8000-000000000040','admin36@example.test');
insert into public.people(id,document_type,document_number,first_names,last_names,email,phone,job_title)
values ('36000000-0000-4000-8000-000000000041','dni','36100041','Admin','Preventa','admin36@example.test','936000041','Administradora');
insert into public.user_accounts(user_id,person_id,role)
values ('36000000-0000-4000-8000-000000000040','36000000-0000-4000-8000-000000000041','administrator');
insert into public.member_companies(ruc,legal_name) values ('20360000001','Empresa Preventa'),('20360000002','Empresa Cortesía');
insert into public.activities(id,type,title,slug,description,modality,is_free,general_price,member_price,members_only,status,published_at,payment_note,contact_phone,maps_embed_url,presale_general_price,presale_member_price,presale_ends_at,member_free_passes_per_company,capacity)
values
 ('36000000-0000-4000-8000-000000000001','event','Preventa abierta','preventa-36-abierto','Prueba de preventa','in_person',false,170,150,false,'published',now(),'Coordina el pago','900000001','https://www.google.com/maps/embed?pb=36',160,140,now()+interval '1 hour',0,20),
 ('36000000-0000-4000-8000-000000000002','event','Preventa exclusiva','preventa-36-exclusivo','Prueba de preventa','in_person',false,0,170,true,'published',now(),'Coordina el pago','900000001','https://www.google.com/maps/embed?pb=36',null,160,now()+interval '1 hour',1,20),
 ('36000000-0000-4000-8000-000000000003','training','Capacitación regular','preventa-36-training','Prueba sin preventa','in_person',false,170,150,false,'published',now(),'Coordina el pago','900000001','https://www.google.com/maps/embed?pb=36',null,null,null,0,20);
insert into public.activity_dates(activity_id,starts_at,ends_at)
select id,now()+interval '7 days',now()+interval '7 days 2 hours' from public.activities where slug like 'preventa-36-%';
set constraints validate_activity_presale immediate;
set constraints validate_activity_presale deferred;
select is((select presale_member_price from public.activities where id='36000000-0000-4000-8000-000000000003'),null::numeric,'existing training has no presale');

-- Exact inclusive day in Lima, independently from the test execution date.
create temporary table boundary36 as select jsonb_populate_record(null::public.activities,
  to_jsonb(a)||'{"presale_ends_at":"2026-10-21T05:00:00Z"}'::jsonb) as activity
from public.activities a where id='36000000-0000-4000-8000-000000000001';
select is(public.activity_participation_price((select activity from boundary36),'general','2026-10-21T04:59:59.999999Z'),160::numeric,'last instant of October 20 Lima is presale');
select is(public.activity_participation_price((select activity from boundary36),'general','2026-10-21T05:00:00Z'),170::numeric,'exact midnight is regular');
select is(public.activity_participation_price((select activity from boundary36),'member','2026-10-21T04:59:59Z'),140::numeric,'member presale uses its audience');
select is(public.activity_participation_price((select jsonb_populate_record(activity,'{"presale_member_price":null}'::jsonb) from boundary36),'member','2026-10-21T04:59:59Z'),150::numeric,'audience without presale retains regular');

create temporary table input36 as select
 '{"document_type":"dni","document_number":"36100001","first_names":"Ana","last_names":"Preventa","email":"nueva36@example.test","phone":"936000001","registration_type":"general","participant_profile":"professional","company":"Organización de prueba","ruc":"20360000001","job_title":"Gerente","expected_unit_price":160,"billing":{"type":"factura","document":"20360000001","name":"Organización de prueba","address":"Dirección fiscal"}}'::jsonb as individual,
 '{"ruc":"20360000001","expected_free_count":1,"expected_unit_price":160,"billing":{"type":"boleta","document":"36100010","name":"Ana Grupo"},"attendees":[{"document_type":"dni","document_number":"36100010","first_names":"Ana","last_names":"Grupo","email":"ana-grupo36@example.test","phone":"936000010","job_title":"Gerente"},{"document_type":"dni","document_number":"36100011","first_names":"Bea","last_names":"Grupo","email":"bea-grupo36@example.test","phone":"936000011","job_title":"Gerente"}]}'::jsonb as grouped,
 jsonb_build_array(jsonb_build_object('starts_at',now()+interval '7 days','ends_at',now()+interval '7 days 2 hours','label','','sort_order',0)) as dates;
grant select on input36 to anon,authenticated;
insert into public.people(document_type,document_number,first_names,last_names,email,phone,job_title,address)
values ('dni','36100001','Ana','Histórica','original36@example.test','936000001','Gerente','Dirección histórica');

set local role anon;
select throws_ok($$select public.register_activity('36000000-0000-4000-8000-000000000001',(select individual-'expected_unit_price' from input36))$$,'P0001','PRICE_CHANGED','legacy form must reload when presale exists');
select throws_ok($$select public.register_activity('36000000-0000-4000-8000-000000000001',(select individual||'{"expected_unit_price":1}'::jsonb from input36))$$,'P0001','PRICE_CHANGED','forged individual quote is rejected');
reset role;
select is((select email from public.people where document_number='36100001'),'original36@example.test','rejected quote does not modify person');
select is((select count(*) from public.registrations where activity_id='36000000-0000-4000-8000-000000000001'),0::bigint,'rejected quote consumes no seats');
select is((select count(*) from public.notification_outbox where payload->>'activity_id'='36000000-0000-4000-8000-000000000001'),0::bigint,'rejected quote creates no notification');
set local role anon;
select lives_ok($$select public.register_activity('36000000-0000-4000-8000-000000000001',(select individual from input36))$$,'general presale registration succeeds');
select lives_ok($$select public.register_activity('36000000-0000-4000-8000-000000000001',(select individual||'{"document_number":"36100002","registration_type":"member","expected_unit_price":140}'::jsonb from input36))$$,'member individual uses member presale');
select lives_ok($$select public.register_activity('36000000-0000-4000-8000-000000000001',(select individual||'{"document_number":"36100003","participant_profile":"student","academic_institution":"Instituto de prueba","career":"Gestión"}'::jsonb from input36))$$,'student receives general presale without new profile requirements');
reset role;
select is((select price_snapshot from public.registrations r join public.people p on p.id=r.person_id where p.document_number='36100001'),160::numeric,'snapshot freezes general presale');
select is((select price_snapshot from public.registrations r join public.people p on p.id=r.person_id where p.document_number='36100002'),140::numeric,'snapshot freezes member presale');
select is((select address from public.people where document_number='36100001'),'Dirección histórica','omitting province preserves historical address');
select is((select participation_amount from public.participation_billing_requests where activity_id='36000000-0000-4000-8000-000000000001' and id=(select r.id from public.registrations r join public.people p on p.id=r.person_id where p.document_number='36100001')),160::numeric,'billing view uses historical amount');
update public.activities set presale_ends_at=now()-interval '1 second' where id='36000000-0000-4000-8000-000000000001';
set local role anon;
select throws_ok($$select public.register_activity('36000000-0000-4000-8000-000000000001',(select individual||'{"document_number":"36100004"}'::jsonb from input36))$$,'P0001','PRICE_CHANGED','expired preview rejects before participant writes');
select lives_ok($$select public.register_activity('36000000-0000-4000-8000-000000000001',(select individual||'{"document_number":"36100004","expected_unit_price":170}'::jsonb from input36))$$,'new confirmation receives regular price');
reset role;
select is((select price_snapshot from public.registrations r join public.people p on p.id=r.person_id where p.document_number='36100001'),160::numeric,'deadline does not recalculate previous snapshot');
set local role authenticated;
select set_config('request.jwt.claim.sub','36000000-0000-4000-8000-000000000040',true);
select lives_ok($$select public.verify_individual_registration_payment((select r.id from public.registrations r join public.people p on p.id=r.person_id where p.document_number='36100001'),160,'OP-36',null,'36000000-0000-4000-8000-000000000050')$$,'payment after deadline validates original snapshot');
reset role;

set local role anon;
select throws_ok($$select public.register_member_group('36000000-0000-4000-8000-000000000002',(select grouped||'{"expected_unit_price":1}'::jsonb from input36),'36000000-0000-4000-8000-000000000060')$$,'P0001','PRICE_CHANGED','forged group price rejected atomically');
reset role;
select is((select count(*) from public.member_complimentary_passes where activity_id='36000000-0000-4000-8000-000000000002'),0::bigint,'rejected group consumes no passes');
select is((select count(*) from public.member_group_requests where activity_id='36000000-0000-4000-8000-000000000002'),0::bigint,'rejected group creates no request');
select is((select count(*) from public.member_group_submission_limits where company_ruc='20360000001'),0::bigint,'rejected quote does not consume submission attempts');
set local role anon;
select lives_ok($$select public.register_member_group('36000000-0000-4000-8000-000000000002',(select grouped from input36),'36000000-0000-4000-8000-000000000060')$$,'mixed group succeeds with presale');
reset role;
select is((select sum(price_snapshot) from public.registrations where activity_id='36000000-0000-4000-8000-000000000002'),160::numeric,'mixed group sums free zero plus presale');
select is((select count(*) from public.registrations where activity_id='36000000-0000-4000-8000-000000000002' and status='confirmed' and price_snapshot=0),1::bigint,'complimentary seat remains confirmed and free');
select is((select (payload->>'group_total')::numeric from public.notification_outbox where related_entity_id=(select id from public.member_group_requests where activity_id='36000000-0000-4000-8000-000000000002') and event_type='activity_group_request_received'),160::numeric,'group notification uses snapshot total');
update public.activities set presale_ends_at=now()-interval '1 second' where id='36000000-0000-4000-8000-000000000002';
set local role anon;
select is((public.register_member_group('36000000-0000-4000-8000-000000000002',(select grouped from input36),'36000000-0000-4000-8000-000000000060')->>'total')::numeric,160::numeric,'replay after deadline returns original price');
select lives_ok($$select public.register_member_group('36000000-0000-4000-8000-000000000002','{"ruc":"20360000002","expected_free_count":1,"expected_unit_price":170,"billing":null,"attendees":[{"document_type":"dni","document_number":"36100012","first_names":"Carla","last_names":"Cortesía","email":"carla36@example.test","phone":"936000012","job_title":"Gerente"}]}','36000000-0000-4000-8000-000000000061')$$,'fully complimentary group needs no billing');
select lives_ok($$select public.register_activity('36000000-0000-4000-8000-000000000003',(select individual-'expected_unit_price'||'{"document_number":"36100020"}'::jsonb from input36))$$,'legacy training retains regular individual behavior');
reset role;
select is((select count(*) from public.member_group_requests where activity_id='36000000-0000-4000-8000-000000000002'),2::bigint,'replay creates no additional request');
select is((select billing_type from public.member_group_requests where idempotency_key='36000000-0000-4000-8000-000000000061'),null::text,'courtesy group persists no placeholder billing');

-- Deferred final-state validation supports existing administrative wrappers.
select throws_ok($$do $test$ begin update public.activities set presale_general_price=170 where id='36000000-0000-4000-8000-000000000001'; set constraints validate_activity_presale immediate; end $test$;$$,'23514','INVALID_ACTIVITY_PRESALE','presale cannot equal regular');
select throws_ok($$do $test$ begin update public.activities set presale_ends_at=null where id='36000000-0000-4000-8000-000000000001'; set constraints validate_activity_presale immediate; end $test$;$$,'23514','INVALID_ACTIVITY_PRESALE','published presale needs deadline');
select throws_ok($$do $test$ begin update public.activities set presale_general_price=100,presale_ends_at=now()+interval '1 hour' where id='36000000-0000-4000-8000-000000000003'; set constraints validate_activity_presale immediate; end $test$;$$,'23514','INVALID_ACTIVITY_PRESALE','training rejects presale directly in SQL');
select throws_ok($$update public.activities set presale_general_price=1.005 where id='36000000-0000-4000-8000-000000000001'$$,'23514',null,'more than two decimals rejected without rounding');

set local role authenticated;
select set_config('request.jwt.claim.sub','36000000-0000-4000-8000-000000000040',true);
select lives_ok($$select public.save_activity('{"type":"event","title":"Borrador de preventa","slug":"preventa-36-admin","description":"Prueba administrativa de preventa","modality":"in_person","is_free":false,"general_price":170,"member_price":150,"status":"draft","presale_general_price":160}',(select dates from input36),'[]')$$,'draft may save a presale price without deadline');
select lives_ok($$select public.save_activity((select to_jsonb(a)||jsonb_build_object('presale_ends_at',now()+interval '1 day') from public.activities a where slug='preventa-36-admin'),(select dates from input36),'[]')$$,'admin can complete presale configuration');
select lives_ok($$select public.save_activity((select to_jsonb(a)-'presale_general_price'-'presale_member_price'-'presale_ends_at' from public.activities a where slug='preventa-36-admin'),(select dates from input36),'[]')$$,'old client may edit while omitting presale fields');
reset role;
select is((select presale_general_price from public.activities where slug='preventa-36-admin'),160::numeric,'omitted fields preserve existing presale');
select ok((select presale_ends_at is not null from public.activities where slug='preventa-36-admin'),'omitted deadline remains unchanged');
set local role authenticated;
select lives_ok($$select public.save_activity((select to_jsonb(a)||'{"presale_general_price":null,"presale_member_price":null,"presale_ends_at":null}'::jsonb from public.activities a where slug='preventa-36-admin'),(select dates from input36),'[]')$$,'explicit clearing disables presale');
reset role;
select is((select presale_general_price from public.activities where slug='preventa-36-admin'),null::numeric,'presale remains optional');
select ok(exists(select 1 from public.audit_logs where action='activity.presale_changed' and entity_id=(select id from public.activities where slug='preventa-36-admin')),'configuration changes are audited');
set constraints validate_activity_presale immediate;
select * from finish(true);
rollback;
