begin;
select no_plan();
select is(public.privacy_consent_enforced(),false,'production enforcement remains off until frontend is published');
select ok(exists(select 1 from public.privacy_policy_versions where version=public.current_privacy_version() and content->>'contact'='comercial@camaraica.org.pe'),'immutable policy and contact exist');
select is(has_table_privilege('anon','public.privacy_consent_records','SELECT'),false,'anonymous cannot read consent evidence');
select is(has_table_privilege('authenticated','public.privacy_consent_records','INSERT'),false,'browser cannot insert acceptance evidence');
select is(has_table_privilege('service_role','public.privacy_consent_records','INSERT'),false,'service client cannot fabricate acceptance directly');
select is(has_function_privilege('anon','public.record_privacy_consent(uuid,jsonb,text,text,uuid,uuid,uuid)','EXECUTE'),false,'recording helper is private');
select is(has_function_privilege('anon','public.register_activity_before_privacy(uuid,jsonb)','EXECUTE'),false,'old registration wrapper is private');
select is(has_function_privilege('authenticated','public.enroll_free_course_before_privacy(uuid)','EXECUTE'),false,'legacy enrollment core cannot bypass consent');
select is(has_function_privilege('anon','public.register_member_group_before_privacy(uuid,jsonb,uuid)','EXECUTE'),false,'group core cannot bypass consent');
select throws_ok($$update public.privacy_policy_versions set content='{}'$$,'42501','PRIVACY_HISTORY_IMMUTABLE','policy versions cannot be overwritten');

insert into public.activities(id,type,title,slug,description,modality,is_free,general_price,member_price,status,published_at,members_only,maps_embed_url,contact_phone)
values
 ('42000000-0000-4000-8000-000000000001','event','Privacidad evento','privacidad-42-evento','Prueba','in_person',true,0,0,'published',now(),false,'https://www.google.com/maps/embed?pb=42','942000000'),
 ('42000000-0000-4000-8000-000000000002','training','Privacidad capacitación','privacidad-42-training','Prueba','in_person',true,0,0,'published',now(),false,'https://www.google.com/maps/embed?pb=42','942000000'),
 ('42000000-0000-4000-8000-000000000003','event','Privacidad grupo','privacidad-42-grupo','Prueba','in_person',true,0,0,'published',now(),true,'https://www.google.com/maps/embed?pb=42','942000000'),
 ('42000000-0000-4000-8000-000000000004','event','Privacidad legado','privacidad-42-legado','Prueba','in_person',true,0,0,'published',now(),false,'https://www.google.com/maps/embed?pb=42','942000000');
insert into public.activity_dates(activity_id,starts_at,ends_at)
select id,now()+interval '2 days',now()+interval '2 days 2 hours' from public.activities where slug like 'privacidad-42-%';
insert into public.member_companies(ruc,legal_name) values('20420000001','Empresa privacidad');
insert into public.courses(id,title,slug,description,is_free,status,published_at) values
 ('42000000-0000-4000-8000-000000000020','Privacidad curso','privacidad-42-curso','Prueba',true,'published',now()),
 ('42000000-0000-4000-8000-000000000021','Privacidad segundo','privacidad-42-curso-dos','Prueba',true,'published',now());
insert into public.people(id,document_type,document_number,first_names,last_names,email,phone,job_title) values
 ('42000000-0000-4000-8000-000000000040','dni','42000040','Admin','Privacidad','admin42@example.test','942000040','Administrador'),
 ('42000000-0000-4000-8000-000000000041','dni','42000041','Alumno','Anterior','old42@example.test','942000041','Analista');
insert into auth.users(id,email) values
 ('42000000-0000-4000-8000-000000000050','admin42@example.test'),
 ('42000000-0000-4000-8000-000000000051','old42@example.test');
insert into public.user_accounts(user_id,person_id,role) values
 ('42000000-0000-4000-8000-000000000050','42000000-0000-4000-8000-000000000040','administrator'),
 ('42000000-0000-4000-8000-000000000051','42000000-0000-4000-8000-000000000041','student');
create temporary table input42 as select
 '{"document_type":"dni","document_number":"42000001","first_names":"Ana","last_names":"Privacidad","email":"ana42@example.test","phone":"942000001","job_title":"Analista","company":"Empresa","registration_type":"general","participant_profile":"professional"}'::jsonb as person,
 '{"registration_source":"campus","document_type":"dni","document_number":"42000030","first_names":"Cuenta","last_names":"Privacidad","phone":"942000030","job_title":"Analista"}'::jsonb as campus,
 jsonb_build_object('privacy_accepted',true,'privacy_version',public.current_privacy_version(),'marketing_accepted',false) as acceptance,
 '{"ruc":"20420000001","expected_free_count":0,"billing":null,"future_topics_suggestion":"","attendees":[{"document_type":"dni","document_number":"42000011","first_names":"Grupo","last_names":"Uno","email":"group42a@example.test","phone":"942000011","job_title":"Analista","request_certificate":false},{"document_type":"dni","document_number":"42000012","first_names":"Grupo","last_names":"Dos","email":"group42b@example.test","phone":"942000012","job_title":"Analista","request_certificate":false}]}'::jsonb as group_input;
grant select on input42 to anon,authenticated;

-- Compatible deployment: no acceptance is invented for legacy clients.
set local role anon;
select lives_ok($$select public.register_activity('42000000-0000-4000-8000-000000000004',(select person from input42))$$,'legacy frontend continues during compatible rollout');
select throws_ok($$select public.register_activity('42000000-0000-4000-8000-000000000001',(select person||acceptance||'{"privacy_accepted":false}' from input42))$$,'22023','PRIVACY_CONSENT_REQUIRED','explicit false is rejected even before enforcement');
reset role;
select is((select count(*) from public.privacy_consent_records where registration_id in (select id from public.registrations where activity_id='42000000-0000-4000-8000-000000000004')),0::bigint,'legacy registration has no fabricated consent');

-- Enable only inside this rolled-back test transaction.
create or replace function public.privacy_consent_enforced() returns boolean language sql stable set search_path='' as $$select true$$;
create temporary table baseline42 as select
 (select count(*) from public.registrations) as registrations,
 (select count(*) from public.people) as people,
 (select count(*) from public.notification_outbox) as notifications,
 (select count(*) from public.privacy_consent_records) as consents;
set local role anon;
select throws_ok($$select public.register_activity('42000000-0000-4000-8000-000000000001',(select person from input42))$$,'22023','PRIVACY_CONSENT_REQUIRED','direct individual RPC requires acceptance');
select throws_ok($$select public.register_activity('42000000-0000-4000-8000-000000000001',(select person||acceptance||'{"privacy_accepted":"true"}' from input42))$$,'22023','PRIVACY_CONSENT_REQUIRED','text is not boolean acceptance');
select throws_ok($$select public.register_activity('42000000-0000-4000-8000-000000000001',(select person||acceptance||'{"privacy_version":"old"}' from input42))$$,'22023','PRIVACY_POLICY_CHANGED','old policy version is rejected');
select throws_ok($$select public.register_activity('42000000-0000-4000-8000-000000000001',(select person||acceptance||'{"marketing_accepted":"false"}' from input42))$$,'22023','PRIVACY_CONSENT_REQUIRED','string marketing flag is rejected');
select throws_ok($$select public.register_member_group('42000000-0000-4000-8000-000000000003',(select group_input from input42),'42000000-0000-4000-8000-000000000080')$$,'22023','PRIVACY_CONSENT_REQUIRED','group direct RPC requires authorization');
reset role;
select is((select count(*) from public.registrations),(select registrations from baseline42),'rejections do not consume seats');
select is((select count(*) from public.people),(select people from baseline42),'rejections do not create or edit people');
select is((select count(*) from public.notification_outbox),(select notifications from baseline42),'rejections do not create notifications');
select is((select count(*) from public.privacy_consent_records),(select consents from baseline42),'rejections do not create evidence');

set local role anon;
select lives_ok($$select public.register_activity('42000000-0000-4000-8000-000000000001',(select person||acceptance||'{"marketing_accepted":true,"recorded_at":"2000-01-01"}' from input42))$$,'individual can accept both purposes');
select lives_ok($$select public.register_activity('42000000-0000-4000-8000-000000000002',(select person||acceptance from input42))$$,'later registration may decline publicity without withdrawing prior permission');
select lives_ok($$select public.register_member_group('42000000-0000-4000-8000-000000000003',(select group_input||acceptance||'{"marketing_accepted":true}' from input42),'42000000-0000-4000-8000-000000000080')$$,'representative may authorize entire group');
select lives_ok($$select public.register_member_group('42000000-0000-4000-8000-000000000003',(select group_input||acceptance||'{"marketing_accepted":true}' from input42),'42000000-0000-4000-8000-000000000080')$$,'group retry succeeds without duplicate evidence');
reset role;
select is((select count(*) from public.privacy_consent_records where source='group' and group_request_id in(select id from public.member_group_requests where activity_id='42000000-0000-4000-8000-000000000003')),4::bigint,'one consent per purpose and group participant, even after retry');
select ok((select bool_and(actor_type='representative') from public.privacy_consent_records where source='group' and group_request_id in(select id from public.member_group_requests where activity_id='42000000-0000-4000-8000-000000000003')),'group evidence distinguishes representative from participant');
select ok((select bool_and(recorded_at>=transaction_timestamp()) from public.privacy_consent_records where person_id in (select id from public.people where document_number='42000001')),'acceptance time comes from database');
select throws_ok($$update public.privacy_consent_records set action='withdrawn' where person_id in(select id from public.people where document_number='42000001')$$,'42501','PRIVACY_HISTORY_IMMUTABLE','evidence cannot be edited');

-- Auth acceptance must be validated before a person or account is created.
select throws_ok($$insert into auth.users(id,email,raw_user_meta_data) values('42000000-0000-4000-8000-000000000060','new42@example.test',(select campus from input42))$$,'22023','PRIVACY_CONSENT_REQUIRED','direct Campus signup cannot omit acceptance');
select is((select count(*) from auth.users where id='42000000-0000-4000-8000-000000000060'),0::bigint,'rejected signup leaves no Auth user');
select is((select count(*) from public.people where document_number='42000030'),0::bigint,'rejected signup leaves no person');
select lives_ok($$insert into auth.users(id,email,raw_user_meta_data) values('42000000-0000-4000-8000-000000000060','new42@example.test',(select campus||acceptance from input42))$$,'Campus signup accepts operational processing without publicity');
select is((select count(*) from public.privacy_consent_records where user_id='42000000-0000-4000-8000-000000000060'),2::bigint,'Campus signup persists both selections atomically');
select is((select raw_user_meta_data ? 'privacy_accepted' from auth.users where id='42000000-0000-4000-8000-000000000060'),false,'mutable Auth metadata is not retained as evidence');

set local role authenticated;
select set_config('request.jwt.claim.sub','42000000-0000-4000-8000-000000000051',true);
select is(public.has_current_campus_privacy(),false,'old account has no invented acceptance');
select throws_ok($$select public.enroll_free_course('42000000-0000-4000-8000-000000000020')$$,'22023','PRIVACY_CONSENT_REQUIRED','old account must accept before new enrollment');
select throws_ok($$select public.enroll_free_course_with_privacy('42000000-0000-4000-8000-000000000020','{"privacy_accepted":false}')$$,'22023','PRIVACY_CONSENT_REQUIRED','acceptance cannot be bypassed with false');
select lives_ok($$select public.enroll_free_course_with_privacy('42000000-0000-4000-8000-000000000020',(select acceptance from input42))$$,'old account accepts and enrolls in one transaction');
select is(public.has_current_campus_privacy(),true,'Campus acceptance is reused for this account');
select lives_ok($$select public.enroll_free_course('42000000-0000-4000-8000-000000000021')$$,'next course does not require another acceptance');
select is((select count(*) from public.privacy_consent_records),0::bigint,'student cannot read private consent histories');
select throws_ok($$select public.withdraw_marketing_consent('42000000-0000-4000-8000-000000000041','Baja')$$,'42501','FORBIDDEN','student cannot execute an administrative withdrawal');
reset role;
select is((select count(*) from public.privacy_consent_records where person_id='42000000-0000-4000-8000-000000000041' and purpose='campus'),1::bigint,'subsequent course does not duplicate Campus acceptance');

set local role authenticated;
select set_config('request.jwt.claim.sub','42000000-0000-4000-8000-000000000050',true);
select is((select count(*) from public.authorized_marketing_contacts where email in('ana42@example.test','group42a@example.test','group42b@example.test')),3::bigint,'authorized export includes explicit individual and group permission');
select is((select count(*) from public.authorized_marketing_contacts where email='new42@example.test'),0::bigint,'declining marketing does not enter publicity list');
select lives_ok($$select public.withdraw_marketing_consent((select person_id from public.authorized_marketing_contacts where email='ana42@example.test'),'Solicitud recibida por correo')$$,'administrator records requested withdrawal');
select is((select count(*) from public.authorized_marketing_contacts where email='ana42@example.test'),0::bigint,'withdrawal excludes participant from promotional export');
reset role;
select is((select count(*) from public.audit_logs where action='marketing_consent_withdrawn' and actor_user_id='42000000-0000-4000-8000-000000000050'),1::bigint,'withdrawal is audited');
select is((select count(*) from public.registrations r join public.people p on p.id=r.person_id where p.document_number='42000001'),3::bigint,'withdrawal does not cancel existing participation');

-- Failure of enrollment must roll back acceptance too.
set local role authenticated;
select set_config('request.jwt.claim.sub','42000000-0000-4000-8000-000000000060',true);
select is(public.has_current_campus_privacy(),true,'signup acceptance is already valid for the Campus');
reset role;

-- A failed enrollment must not leave a consent accepted without its requested operation.
insert into public.people(id,document_type,document_number,first_names,last_names,email,phone,job_title)
values('42000000-0000-4000-8000-000000000042','dni','42000042','Alumno','Sin autorización','old42b@example.test','942000042','Analista');
insert into auth.users(id,email) values('42000000-0000-4000-8000-000000000052','old42b@example.test');
insert into public.user_accounts(user_id,person_id,role)
values('42000000-0000-4000-8000-000000000052','42000000-0000-4000-8000-000000000042','student');
insert into public.course_enrollments(course_id,person_id,status,registration_type,price_snapshot)
values('42000000-0000-4000-8000-000000000020','42000000-0000-4000-8000-000000000042','active','general',0);
set local role authenticated;
select set_config('request.jwt.claim.sub','42000000-0000-4000-8000-000000000052',true);
select lives_ok($$select public.enroll_free_course('42000000-0000-4000-8000-000000000020')$$,'existing course remains available without retroactive acceptance');
select throws_ok($$select public.enroll_free_course_with_privacy('42000000-0000-4000-8000-000000000099',(select acceptance from input42))$$,'P0001','COURSE_NOT_AVAILABLE','failed course enrollment is rejected');
reset role;
select is((select count(*) from public.privacy_consent_records where person_id='42000000-0000-4000-8000-000000000042'),0::bigint,'failed enrollment rolls back the newly recorded acceptance');
select is((select count(*) from public.course_enrollments where person_id='42000000-0000-4000-8000-000000000042'),1::bigint,'failed enrollment does not add a course');

-- Rejections also preserve the details of an existing participant.
set local role anon;
select throws_ok($$select public.register_activity('42000000-0000-4000-8000-000000000001',(select person||acceptance||'{"document_number":"42000042","first_names":"Nombre alterado","privacy_accepted":false}' from input42))$$,'22023','PRIVACY_CONSENT_REQUIRED','reject before updating existing personal data');
reset role;
select is((select first_names from public.people where id='42000000-0000-4000-8000-000000000042'),'Alumno','existing personal data stays unchanged');

-- Changes in policy do not invalidate a successfully submitted group retry.
insert into public.privacy_policy_versions(version,content)
select '42.test.v2',content||'{"version":"42.test.v2"}' from public.privacy_policy_versions where version=public.current_privacy_version();
create or replace function public.current_privacy_version() returns text language sql immutable set search_path='' as $$select '42.test.v2'::text$$;
set local role anon;
select lives_ok($$select public.register_member_group('42000000-0000-4000-8000-000000000003',(select group_input||acceptance||'{"marketing_accepted":true}' from input42),'42000000-0000-4000-8000-000000000080')$$,'historical successful group replay does not require accepting a different version');
select throws_ok($$select public.register_activity('42000000-0000-4000-8000-000000000001',(select person||acceptance||'{"document_number":"42000099"}' from input42))$$,'22023','PRIVACY_POLICY_CHANGED','new submission must use the new policy');
reset role;
select is((select count(*) from public.people where document_number='42000099'),0::bigint,'stale form does not create a person');
select * from finish(true);
rollback;
