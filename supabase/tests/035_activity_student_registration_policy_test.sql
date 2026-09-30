begin;
select no_plan();

select ok(exists(select 1 from information_schema.columns where table_schema='public' and table_name='activities'
  and column_name='allows_student_registration' and data_type='boolean' and is_nullable='NO'), 'policy is a required boolean');
select is(has_function_privilege('anon','public.save_activity(jsonb,jsonb,jsonb)','EXECUTE'), false, 'anonymous users cannot change policy');
select is(has_function_privilege('authenticated','public.save_activity_without_student_policy(jsonb,jsonb,jsonb)','EXECUTE'), false, 'old save wrapper stays private');
select is(has_function_privilege('service_role','public.save_activity_without_student_policy(jsonb,jsonb,jsonb)','EXECUTE'), false, 'service role cannot bypass policy save');
select is(has_function_privilege('anon','public.register_activity_internal_before_billing(uuid,jsonb)','EXECUTE'), false, 'registration core stays private');

insert into auth.users(id,email) values ('35000000-0000-4000-8000-000000000040','admin35@example.test');
insert into public.people(id,document_type,document_number,first_names,last_names,email,phone,job_title)
values ('35000000-0000-4000-8000-000000000041','dni','35100041','Admin','Perfiles','admin35@example.test','935000041','Administradora');
insert into public.user_accounts(user_id,person_id,role)
values ('35000000-0000-4000-8000-000000000040','35000000-0000-4000-8000-000000000041','administrator');
insert into public.activities(id,type,title,slug,description,modality,is_free,general_price,member_price,status,published_at,contact_phone,maps_embed_url,allows_student_registration)
values
 ('35000000-0000-4000-8000-000000000001','event','Solo profesionales','perfiles-35-evento','Prueba de perfiles','in_person',true,0,0,'published',now(),'900000001','https://www.google.com/maps/embed?pb=35',false),
 ('35000000-0000-4000-8000-000000000002','training','Solo profesionales','perfiles-35-capacitacion','Prueba de perfiles','in_person',true,0,0,'published',now(),'900000001','https://www.google.com/maps/embed?pb=35',false),
 ('35000000-0000-4000-8000-000000000003','event','Perfiles abiertos','perfiles-35-abierto','Prueba de perfiles','in_person',true,0,0,'published',now(),'900000001','https://www.google.com/maps/embed?pb=35',true);
insert into public.activities(id,type,title,slug,description,modality,is_free,general_price,member_price,status,published_at,contact_phone,maps_embed_url,payment_note,allows_student_registration)
values ('35000000-0000-4000-8000-000000000004','event','Profesionales pagado','perfiles-35-pagado','Prueba de perfiles','in_person',false,30,20,'published',now(),'900000001','https://www.google.com/maps/embed?pb=35','Coordina el pago',false);
insert into public.activity_dates(activity_id,starts_at,ends_at)
select id,now()+interval '2 days',now()+interval '2 days 2 hours' from public.activities where slug like 'perfiles-35-%';
insert into public.people(id,document_type,document_number,first_names,last_names,email,phone,participant_profile,academic_institution,career)
values ('35000000-0000-4000-8000-000000000010','dni','35100001','Ana','Estudiante','original35@example.test','935000001','student','Universidad original','Carrera original');

create temporary table input35 as select
  '{"document_type":"dni","document_number":"35100001","first_names":"Ana","last_names":"Estudiante","email":"nueva35@example.test","phone":"935000002","registration_type":"general","participant_profile":"student","academic_institution":"Universidad de prueba","career":"Administración"}'::jsonb as student,
  '{"type":"event","title":"Prueba de configuración","slug":"perfiles-35-admin","description":"Prueba de configuración de perfiles","modality":"in_person","is_free":true,"general_price":0,"member_price":0,"status":"draft"}'::jsonb as activity,
  jsonb_build_array(jsonb_build_object('starts_at',now()+interval '3 days','ends_at',now()+interval '3 days 2 hours','sort_order',0)) as dates;
grant select on input35 to anon,authenticated;
create temporary table baseline35 as select
  (select to_jsonb(p) from public.people p where document_number='35100001') as person,
  (select count(*) from public.registrations) as registrations,
  (select count(*) from public.attendance) as attendance,
  (select count(*) from public.notification_outbox) as notifications,
  (select count(*) from public.registration_billing_details) as billing,
  (select count(*) from public.audit_logs) as audits;

set local role anon;
select throws_ok($$select public.register_activity('35000000-0000-4000-8000-000000000001',(select student from input35))$$,
  'P0001','STUDENT_REGISTRATION_NOT_ALLOWED','event rejects a declared student through the public RPC');
select throws_ok($$select public.register_activity('35000000-0000-4000-8000-000000000002',(select student||'{"document_number":"35100002"}'::jsonb from input35))$$,
  'P0001','STUDENT_REGISTRATION_NOT_ALLOWED','training rejects a new student before creating their person');
select throws_ok($$select public.register_activity('35000000-0000-4000-8000-000000000004',(select student||'{"document_number":"35100007","billing":{"type":"boleta","document":"35100007","name":"Ana Estudiante"}}'::jsonb from input35))$$,
  'P0001','STUDENT_REGISTRATION_NOT_ALLOWED','paid activity rejects a student without bypassing billing wrapper');
reset role;
select is((select to_jsonb(p) from public.people p where document_number='35100001'),(select person from baseline35),'rejected registration leaves existing person untouched');
select ok(not exists(select 1 from public.people where document_number='35100002'),'rejected registration does not create a person');
select is((select count(*) from public.registrations),(select registrations from baseline35),'rejection creates no registration or occupied seat');
select is((select count(*) from public.attendance),(select attendance from baseline35),'rejection creates no attendance record');
select is((select count(*) from public.notification_outbox),(select notifications from baseline35),'rejection sends no notifications');
select is((select count(*) from public.registration_billing_details),(select billing from baseline35),'rejected paid registration creates no billing record');
select is((select count(*) from public.audit_logs),(select audits from baseline35),'rejection creates no registration audit');

set local role anon;
select lives_ok($$select public.register_activity('35000000-0000-4000-8000-000000000003',(select student from input35))$$,'enabled activity accepts a student');
select lives_ok($$select public.register_activity('35000000-0000-4000-8000-000000000001',(select student||'{"document_number":"35100003","participant_profile":"professional","company":"Universidad de prueba","ruc":"20123456789","job_title":"Docente"}'::jsonb from input35))$$,'professional profile may declare a university as organization');
select lives_ok($$select public.register_activity('35000000-0000-4000-8000-000000000002',(select student||'{"document_number":"35100004","participant_profile":"professional","registration_type":"member","company":"Empresa asociada","ruc":"20987654321","job_title":"Gerente"}'::jsonb from input35))$$,'member professional remains allowed');
select throws_ok($$select public.register_activity('35000000-0000-4000-8000-000000000001',(select student||'{"document_number":"35100005","participant_profile":"professional","company":"Empresa","job_title":"Analista"}'::jsonb from input35))$$,'22023','VALIDATION_ERROR','professional still needs RUC');
reset role;
select is((select status from public.registrations where activity_id='35000000-0000-4000-8000-000000000001'),'confirmed'::public.registration_status,'free professional confirmation remains automatic');
update public.activities set allows_student_registration=false where id='35000000-0000-4000-8000-000000000003';
select is((select status from public.registrations where activity_id='35000000-0000-4000-8000-000000000003'),'confirmed'::public.registration_status,'disabling policy does not cancel historical student registration');
select is((select participant_profile from public.registrations where activity_id='35000000-0000-4000-8000-000000000003'),'student'::public.participant_profile,'historical student snapshot stays intact');
set local role anon;
select throws_ok($$select public.register_activity('35000000-0000-4000-8000-000000000003',(select student||'{"document_number":"35100006"}'::jsonb from input35))$$,'P0001','STUDENT_REGISTRATION_NOT_ALLOWED','previously open form is rejected after policy changes');
reset role;
update public.activities set allows_student_registration=true where id='35000000-0000-4000-8000-000000000003';
set local role anon;
select lives_ok($$select public.register_activity('35000000-0000-4000-8000-000000000003',(select student||'{"document_number":"35100006"}'::jsonb from input35))$$,'reopening permits a new student');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub','35000000-0000-4000-8000-000000000099',true);
select throws_ok($$select public.save_activity((select activity from input35),(select dates from input35),'[]'::jsonb)$$,'42501','UNAUTHORIZED','authenticated outsiders cannot change activity policy');
select set_config('request.jwt.claim.sub','35000000-0000-4000-8000-000000000040',true);
select lives_ok($$select public.save_activity((select activity from input35),(select dates from input35),'[]'::jsonb)$$,'old client can create with policy omitted');
reset role;
select is((select allows_student_registration from public.activities where slug='perfiles-35-admin'),true,'new activity defaults to allowing students');
set local role authenticated;
select lives_ok($$select public.save_activity((select to_jsonb(a)||'{"allows_student_registration":false}'::jsonb from public.activities a where slug='perfiles-35-admin'),(select dates from input35),'[]'::jsonb)$$,'admin can disable student registrations');
reset role;
select is((select allows_student_registration from public.activities where slug='perfiles-35-admin'),false,'explicit false is saved');
select ok(exists(select 1 from public.audit_logs where action='activity.student_registration_policy_changed' and entity_id=(select id from public.activities where slug='perfiles-35-admin')),'policy change is audited');
set local role authenticated;
select lives_ok($$select public.save_activity((select to_jsonb(a)-'allows_student_registration' from public.activities a where slug='perfiles-35-admin'),(select dates from input35),'[]'::jsonb)$$,'old client can edit with policy omitted');
reset role;
select is((select allows_student_registration from public.activities where slug='perfiles-35-admin'),false,'old client omission preserves disabled policy');
set local role authenticated;
select throws_ok($$select public.save_activity((select activity||'{"allows_student_registration":"false"}'::jsonb from input35),(select dates from input35),'[]'::jsonb)$$,'22023','INVALID_STUDENT_REGISTRATION_POLICY','string policy is rejected');
select throws_ok($$select public.save_activity((select activity||'{"allows_student_registration":null}'::jsonb from input35),(select dates from input35),'[]'::jsonb)$$,'22023','INVALID_STUDENT_REGISTRATION_POLICY','null policy is rejected');
select lives_ok($$select public.save_activity((select to_jsonb(a)||'{"members_only":true}'::jsonb from public.activities a where slug='perfiles-35-admin'),(select dates from input35),'[]'::jsonb)$$,'exclusive activity retains independent policy');
reset role;
select is((select allows_student_registration from public.activities where slug='perfiles-35-admin'),false,'exclusive edit preserves existing policy');

select * from finish(true);
rollback;
