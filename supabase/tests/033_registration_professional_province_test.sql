begin;
select no_plan();

select ok(exists(select 1 from information_schema.columns where table_schema='public' and table_name='registrations' and column_name='province_snapshot'), 'registration stores province snapshot');
select ok(not exists(select 1 from information_schema.columns where table_schema='public' and table_name='people' and column_name='province'), 'province reuses existing address field');
select is(has_function_privilege('anon','public.register_activity_internal_before_billing(uuid,jsonb)','EXECUTE'), false, 'core registration stays private');
select is(has_function_privilege('service_role','public.register_activity_internal_before_billing(uuid,jsonb)','EXECUTE'), false, 'service role cannot bypass billing wrapper');
select is(has_table_privilege('anon','public.admin_registration_records','SELECT'), false, 'province snapshots are not publicly readable');

insert into auth.users(id,email) values ('33000000-0000-4000-8000-000000000040','admin33@example.test');
insert into public.people(id,document_type,document_number,first_names,last_names,email,phone,job_title)
values ('33000000-0000-4000-8000-000000000041','dni','33100041','Admin','Provincia','admin33@example.test','933000041','Administradora');
insert into public.user_accounts(user_id,person_id,role)
values ('33000000-0000-4000-8000-000000000040','33000000-0000-4000-8000-000000000041','administrator');
insert into public.activities(id,type,title,slug,description,modality,is_free,general_price,member_price,status,published_at,contact_phone,maps_embed_url,payment_note)
values
 ('33000000-0000-4000-8000-000000000001','event','Provincia uno','provincia-33-uno','Prueba','in_person',true,0,0,'published',now(),'900000001','https://www.google.com/maps/embed?pb=33',null),
 ('33000000-0000-4000-8000-000000000002','training','Provincia dos','provincia-33-dos','Prueba','in_person',true,0,0,'published',now(),'900000001','https://www.google.com/maps/embed?pb=33',null),
 ('33000000-0000-4000-8000-000000000003','event','Provincia tres','provincia-33-tres','Prueba','in_person',true,0,0,'published',now(),'900000001','https://www.google.com/maps/embed?pb=33',null),
 ('33000000-0000-4000-8000-000000000004','event','Provincia pago','provincia-33-pago','Prueba','in_person',false,60,40,'published',now(),'900000001','https://www.google.com/maps/embed?pb=33','Coordina el pago');
insert into public.activity_dates(activity_id,starts_at,ends_at)
select id,now()+interval '2 days',now()+interval '2 days 2 hours' from public.activities where slug like 'provincia-33-%';
insert into public.people(id,document_type,document_number,first_names,last_names,email,phone,job_title,address)
values ('33000000-0000-4000-8000-000000000010','dni','33100001','Ana','Provincia','ana33@example.test','933000001','Analista','Av. Histórica 123');
create temporary table input33 as select '{"document_type":"dni","document_number":"33100001","first_names":"Ana","last_names":"Provincia","email":"ana33@example.test","phone":"933000001","job_title":"Analista","registration_type":"general","company":" Organización de prueba "}'::jsonb as payload;
grant select on input33 to anon,authenticated;

set local role anon;
select throws_ok($$select public.register_activity('33000000-0000-4000-8000-000000000001',(select payload-'company' from input33))$$,'22023','VALIDATION_ERROR','professional company is required');
select throws_ok($$select public.register_activity('33000000-0000-4000-8000-000000000001',(select payload||'{"company":"   "}'::jsonb from input33))$$,'22023','VALIDATION_ERROR','blank company is rejected');
select throws_ok($$select public.register_activity('33000000-0000-4000-8000-000000000001',(select payload||'{"company":"x"}'::jsonb from input33))$$,'22023','VALIDATION_ERROR','one-character company is rejected');
select throws_ok($$select public.register_activity('33000000-0000-4000-8000-000000000001',(select payload||jsonb_build_object('address',repeat('x',251)) from input33))$$,'22023','VALIDATION_ERROR','province cannot exceed 250 characters');
select throws_ok($$select public.register_activity('33000000-0000-4000-8000-000000000001',(select payload||'{"registration_type":"member"}'::jsonb from input33))$$,'22023','INVALID_MEMBER_DATA','member RUC remains required');
select lives_ok($$select public.register_activity('33000000-0000-4000-8000-000000000001',(select payload from input33))$$,'general professional may omit RUC and province');
reset role;
select is((select address from public.people where document_number='33100001'),'Av. Histórica 123','omitted province preserves historical value');
select is((select province_snapshot from public.registrations where activity_id='33000000-0000-4000-8000-000000000001'),null::text,'omitted province has null snapshot');
select is((select company_snapshot from public.registrations where activity_id='33000000-0000-4000-8000-000000000001'),'Organización de prueba','organization is trimmed');

set local role anon;
select lives_ok($$select public.register_activity('33000000-0000-4000-8000-000000000002',(select payload||'{"address":" Pisco "}'::jsonb from input33))$$,'province registers for a training');
reset role;
select is((select address from public.people where document_number='33100001'),'Pisco','province updates current person field');
select is((select province_snapshot from public.admin_registration_records where activity_id='33000000-0000-4000-8000-000000000002'),'Pisco','admin view exposes normalized snapshot');
set local role anon;
select lives_ok($$select public.register_activity('33000000-0000-4000-8000-000000000003',(select payload||'{"address":"   "}'::jsonb from input33))$$,'province may be explicitly cleared');
reset role;
select is((select address from public.people where document_number='33100001'),null::text,'explicit empty province clears current value');
select is((select province_snapshot from public.registrations where activity_id='33000000-0000-4000-8000-000000000002'),'Pisco','later registration does not change prior snapshot');

set local role anon;
select lives_ok($$select public.register_activity('33000000-0000-4000-8000-000000000001',(select (payload-'company'-'job_title')||'{"document_number":"33100002","participant_profile":"student","academic_institution":"Universidad de Ica","career":"Administración","address":"No enviar"}'::jsonb from input33))$$,'student does not require professional company');
select throws_ok($$select public.register_activity('33000000-0000-4000-8000-000000000004',(select payload||'{"document_number":"33100003","billing":null}'::jsonb from input33))$$,'22023','BILLING_REQUIRED','billing wrapper still rejects missing fiscal data');
select lives_ok($$select public.register_activity('33000000-0000-4000-8000-000000000004',(select payload||'{"document_number":"33100003","address":"Ica","billing":{"type":"factura","document":"20123456789","name":"Otra empresa","address":"Av. Fiscal 123"}}'::jsonb from input33))$$,'paid registration stores province separately from fiscal address');
reset role;
select is((select province_snapshot from public.registrations r join public.people p on p.id=r.person_id where p.document_number='33100002'),null::text,'student snapshot has no province');
select is((select b.billing_address from public.registration_billing_details b join public.registrations r on r.id=b.registration_id where r.activity_id='33000000-0000-4000-8000-000000000004'),'Av. Fiscal 123','fiscal address is independent');

set local role authenticated;
select set_config('request.jwt.claim.sub','33000000-0000-4000-8000-000000000040',true);
select lives_ok($$select public.update_participant('33000000-0000-4000-8000-000000000010',(select payload||'{"participant_profile":"professional","address":"Chincha","company":""}'::jsonb from input33))$$,'admin can edit province without requiring company in historical records');
reset role;
select is((select address from public.people where document_number='33100001'),'Chincha','admin updates current province');
select is((select province_snapshot from public.registrations where activity_id='33000000-0000-4000-8000-000000000002'),'Pisco','admin does not rewrite snapshot');
set local role authenticated;
select lives_ok($$select public.update_participant('33000000-0000-4000-8000-000000000010',(select payload||'{"participant_profile":"professional","company":""}'::jsonb from input33))$$,'omitting province in an admin update works');
reset role;
select is((select address from public.people where document_number='33100001'),'Chincha','omitted field is not erased by admin update');

select * from finish(true);
rollback;
