begin;
select no_plan();
select ok((select relrowsecurity from pg_class where oid='public.registration_billing_details'::regclass),'billing table has RLS');
select is(has_table_privilege('anon','public.registration_billing_details','SELECT'),false,'anonymous cannot read billing');
select is(has_table_privilege('authenticated','public.registration_billing_details','INSERT'),false,'no direct internal writes');
select is(has_table_privilege('anon','public.participation_billing_requests','SELECT'),false,'billing view is private');
select is(has_function_privilege('service_role','public.register_activity_internal_before_billing(uuid,jsonb)','EXECUTE'),false,'legacy internal RPC cannot bypass billing');
select is(has_function_privilege('anon','public.correct_participation_billing(text,uuid,jsonb,text)','EXECUTE'),false,'anonymous cannot correct billing');

insert into auth.users(id,email) values ('30000000-0000-4000-8000-000000000040','admin30@example.test');
insert into public.people(id,document_type,document_number,first_names,last_names,email,phone,job_title)
values ('30000000-0000-4000-8000-000000000041','dni','30100041','Admin','Comprobantes','admin30@example.test','930000041','Administradora');
insert into public.user_accounts(user_id,person_id,role)
values ('30000000-0000-4000-8000-000000000040','30000000-0000-4000-8000-000000000041','administrator');
insert into public.activities(id,type,title,slug,description,modality,is_free,general_price,member_price,members_only,
 status,published_at,payment_note,contact_phone,maps_embed_url,certificate_mode,certificate_general_price,certificate_member_price)
values
 ('30000000-0000-4000-8000-000000000001','event','Comprobantes abierto','comprobantes-30-abierto','Prueba','in_person',false,60,40,false,'published',now(),'Coordina el pago','900000001','https://www.google.com/maps/embed?pb=30','optional_paid',20,10),
 ('30000000-0000-4000-8000-000000000002','event','Comprobantes grupos','comprobantes-30-grupos','Prueba','in_person',false,0,40,true,'published',now(),'Coordina el pago','900000001','https://www.google.com/maps/embed?pb=30','none',0,0),
 ('30000000-0000-4000-8000-000000000003','training','Comprobantes capacitación','comprobantes-30-capacitacion','Prueba','in_person',false,0,40,true,'published',now(),'Coordina el pago','900000001','https://www.google.com/maps/embed?pb=30','none',0,0),
 ('30000000-0000-4000-8000-000000000004','event','Gratis certificado opcional','comprobantes-30-gratis','Prueba','in_person',true,0,0,false,'published',now(),null,'900000001','https://www.google.com/maps/embed?pb=30','optional_paid',20,10);
insert into public.activity_dates(activity_id,starts_at,ends_at)
select id,now()+interval '2 days',now()+interval '2 days 2 hours' from public.activities where slug like 'comprobantes-30-%';
update public.activities set member_free_passes_per_company=1 where id='30000000-0000-4000-8000-000000000002';
create temporary table input30 as select '{"document_type":"dni","document_number":"30100001","first_names":"Ana","last_names":"Pérez","email":"ana30@example.test","phone":"930000001","job_title":"Gerente","registration_type":"general","company":"Organización de prueba"}'::jsonb as payload;
grant select on input30 to anon,authenticated;
-- Legacy client compatibility is temporary, without inventing historical billing.
set local role anon;
select lives_ok($$select public.register_activity('30000000-0000-4000-8000-000000000001',(select payload from input30))$$,'legacy client works during coordinated rollout');
reset role;
insert into public.registrations(activity_id,person_id,registration_code,price_snapshot,job_title_snapshot,status,confirmed_at)
values ('30000000-0000-4000-8000-000000000004','30000000-0000-4000-8000-000000000041','CCI-30-HISTORICAL',60,'Administradora','confirmed',now());
set constraints all immediate;
set constraints all deferred;
-- Exercise the final enforcement within this rolled-back transaction only.
create or replace function public.registration_billing_enforced() returns boolean language sql stable set search_path='' as $$select true$$;
set local role anon;
select throws_ok($$select public.register_activity('30000000-0000-4000-8000-000000000001',(select payload || '{"document_number":"30100002"}'::jsonb from input30))$$,'22023','BILLING_REQUIRED','old public RPC requires billing after activation');
select throws_ok($$select public.register_activity('30000000-0000-4000-8000-000000000001',(select payload || '{"document_number":"30100002","billing":{"type":"boleta","document":"123","name":"Otra persona"}}'::jsonb from input30))$$,'22023','INVALID_BILLING_DATA','DNI invalid rejected');
select throws_ok($$select public.register_activity('30000000-0000-4000-8000-000000000001',(select payload || '{"document_number":"30100002","billing":{"type":"factura","document":"20123456789","name":"Otra empresa","address":""}}'::jsonb from input30))$$,'22023','INVALID_BILLING_DATA','invoice address required');
select lives_ok($$select public.register_activity('30000000-0000-4000-8000-000000000001',(select payload || '{"document_number":"30100002","billing":{"type":"boleta","document":"30999999","name":"Otro destinatario","address":"no guardar"}}'::jsonb from input30))$$,'paid boleta with different recipient succeeds');
select lives_ok($$select public.register_activity('30000000-0000-4000-8000-000000000001',(select payload || '{"document_type":"ce","document_number":"CE301003","participant_profile":"student","academic_institution":"Universidad Prueba","career":"Gestión","job_title":"","billing":{"type":"factura","document":"20333333333","name":"Facturación distinta","address":"Calle Tres"}}'::jsonb from input30))$$,'student CE uses separate invoice recipient');
select lives_ok($$select public.register_activity('30000000-0000-4000-8000-000000000003',(select payload || '{"document_number":"30100004","registration_type":" MEMBER ","company":"Empresa Capacitación","ruc":"20333333333","billing":{"type":"factura","document":"20444444444","name":"Otra empresa","address":"Calle Cuatro"}}'::jsonb from input30))$$,'exclusive training remains individual with normalized member price');
select lives_ok($$select public.register_activity('30000000-0000-4000-8000-000000000004',(select payload || '{"document_number":"30100005","request_certificate":true,"billing":null}'::jsonb from input30))$$,'free participation with paid certificate needs no billing');
select throws_ok($$select public.register_activity('30000000-0000-4000-8000-000000000001',(select payload || '{"document_number":"30100002","billing":{"type":"boleta","document":"30999999","name":"Otro destinatario"}}'::jsonb from input30))$$,'23505','DUPLICATE_REGISTRATION','duplicate enrollment creates no additional billing');
reset role;
select is((select count(*) from public.people where document_number='30100002'),1::bigint,'invalid attempts leave no partial people');
select is((select count(*) from public.registration_billing_details b join public.registrations r on r.id=b.registration_id where r.activity_id='30000000-0000-4000-8000-000000000001'),2::bigint,'billing saved atomically for two new requests only');
select is((select b.billing_address from public.registration_billing_details b join public.registrations r on r.id=b.registration_id join public.people p on p.id=r.person_id where p.document_number='30100002'),null::text,'boleta discards inactive address');
select is((select count(*) from public.registration_billing_details b join public.registrations r on r.id=b.registration_id where r.activity_id='30000000-0000-4000-8000-000000000004'),0::bigint,'paid optional certificate excluded from billing');
select is((select price_snapshot from public.registrations where activity_id='30000000-0000-4000-8000-000000000003'),40::numeric,'training price remains member price');
select ok(not exists(select 1 from public.notification_outbox where related_entity_id in(select id from public.registrations where activity_id in('30000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000003')) and (payload ? 'billing' or payload::text like '%Otro destinatario%' or payload::text like '%20444444444%')),'billing absent from notification payload');
select ok(not public.get_public_registration_result((select registration_code from public.registrations r join public.people p on p.id=r.person_id where p.document_number='30100002')) ? 'billing','public result exposes no billing');

set local role authenticated;
select set_config('request.jwt.claim.sub','30000000-0000-4000-8000-000000000040',true);
select is((select count(*) from public.participation_billing_requests where activity_id='30000000-0000-4000-8000-000000000001'),3::bigint,'one row per individual including legacy');
select is((select count(*) from public.participation_billing_requests where activity_id='30000000-0000-4000-8000-000000000001' and billing_state='missing'),1::bigint,'legacy identified without backfill');
select is((select count(*) from public.participation_billing_requests where activity_id='30000000-0000-4000-8000-000000000001' and search_text ilike public.admin_literal_pattern('Otro destinatario')),1::bigint,'recipient searchable');
select is((select count(*) from public.participation_billing_requests where activity_id='30000000-0000-4000-8000-000000000003' and kind='individual'),1::bigint,'exclusive training has individual row');
select throws_ok($$select public.correct_participation_billing('individual',(select id from public.registrations where registration_code=(select code from public.participation_billing_requests where activity_id='30000000-0000-4000-8000-000000000001' and billing_state='missing')),'{"type":"boleta","document":"30999999","name":"No completar"}', 'Prueba')$$,'P0001','BILLING_DETAILS_NOT_FOUND','cannot populate historical missing billing');
select throws_ok($$select public.correct_participation_billing('individual',(select id from public.participation_billing_requests where activity_id='30000000-0000-4000-8000-000000000001' and billing_type='boleta'),' {"type":"boleta","document":"30999999","name":"Corrección"}', '')$$,'22023','VALIDATION_ERROR','correction reason mandatory');
select lives_ok($$select public.correct_participation_billing('individual',(select id from public.participation_billing_requests where activity_id='30000000-0000-4000-8000-000000000001' and billing_type='boleta'),'{"type":"factura","document":"20555555555","name":"Empresa Corregida","address":"Calle Cinco"}', 'Solicitado por titular')$$,'existing individual data can be corrected');
select is((select count(*) from public.audit_logs where action='registration.billing_corrected' and metadata->>'reason'='Solicitado por titular'),1::bigint,'correction audit stores reason');
select is((select old_data->>'billing_document' from public.audit_logs where action='registration.billing_corrected' and metadata->>'reason'='Solicitado por titular'),'30999999','audit retains previous document');
select is((select legacy_amount from public.participation_billing_requests where code='CCI-30-HISTORICAL'),60::numeric,'historical confirmation has explicit historical amount');
select is((select validated_amount from public.participation_billing_requests where code='CCI-30-HISTORICAL'),0::numeric,'historical confirmation invents no payment');
select lives_ok($$select public.verify_individual_registration_payment((select id from public.participation_billing_requests where activity_id='30000000-0000-4000-8000-000000000001' and billing_document='20555555555'),60,'OP-IND30',null,'30000000-0000-4000-8000-000000000062')$$,'paid individual becomes complete');
select is((select status from public.participation_billing_requests where activity_id='30000000-0000-4000-8000-000000000001' and billing_document='20555555555'),'complete','individual fully validated state');
select is((select validated_amount from public.participation_billing_requests where activity_id='30000000-0000-4000-8000-000000000001' and billing_document='20555555555'),60::numeric,'individual amount validated without duplication');
select lives_ok($$select public.cancel_registration((select id from public.participation_billing_requests where activity_id='30000000-0000-4000-8000-000000000001' and billing_document='20333333333'),'Cancelación de prueba')$$,'pending individual can be cancelled');
select is((select status from public.participation_billing_requests where activity_id='30000000-0000-4000-8000-000000000001' and billing_document='20333333333'),'cancelled','cancelled billing retained in history');
select is((select pending_amount from public.participation_billing_requests where activity_id='30000000-0000-4000-8000-000000000001' and billing_document='20333333333'),0::numeric,'cancelled balance is zero');
reset role;

insert into public.member_companies(ruc,legal_name) values ('20300000001','Asociada Treinta');
set local role anon;
select public.register_member_group('30000000-0000-4000-8000-000000000002',
'{"ruc":"20300000001","expected_free_count":1,"billing":{"type":"factura","document":"20999999999","name":"Otro RUC","address":"Calle Otra"},"attendees":[{"document_type":"dni","document_number":"30100010","first_names":"Bea","last_names":"Grupo","email":"bea30@example.test","phone":"930000010","job_title":"Gerente"},{"document_type":"dni","document_number":"30100011","first_names":"Carla","last_names":"Grupo","email":"carla30@example.test","phone":"930000011","job_title":"Gerente"},{"document_type":"dni","document_number":"30100012","first_names":"Dora","last_names":"Grupo","email":"dora30@example.test","phone":"930000012","job_title":"Gerente"}]}'::jsonb,'30000000-0000-4000-8000-000000000060');
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','30000000-0000-4000-8000-000000000040',true);
select is((select count(*) from public.participation_billing_requests where activity_id='30000000-0000-4000-8000-000000000002'),1::bigint,'group appears once, not per attendee');
select is((select participation_amount from public.participation_billing_requests where activity_id='30000000-0000-4000-8000-000000000002'),80::numeric,'group amount not multiplied by seats');
select is((select status from public.participation_billing_requests where activity_id='30000000-0000-4000-8000-000000000002'),'pending','courtesy is not a partial payment');
select is((select company_ruc from public.participation_billing_requests where activity_id='30000000-0000-4000-8000-000000000002'),'20300000001','associated RUC retained');
select is((select billing_document from public.participation_billing_requests where activity_id='30000000-0000-4000-8000-000000000002'),'20999999999','invoice RUC distinct');
select lives_ok($$select public.verify_member_group_payment((select id from public.member_group_requests where activity_id='30000000-0000-4000-8000-000000000002'),array(select id from public.registrations where activity_id='30000000-0000-4000-8000-000000000002' and status='pending' order by registration_code limit 1),'OP30',40,null,'30000000-0000-4000-8000-000000000061')$$,'partial group payment works');
select is((select status from public.participation_billing_requests where activity_id='30000000-0000-4000-8000-000000000002'),'partial','actual partial payment identified');
select is((select pending_amount from public.participation_billing_requests where activity_id='30000000-0000-4000-8000-000000000002'),40::numeric,'remaining group balance is one seat');
select lives_ok($$select public.correct_participation_billing('group',(select id from public.member_group_requests where activity_id='30000000-0000-4000-8000-000000000002'),'{"type":"boleta","document":"30888888","name":"Titular Corregido"}','Corrección grupal')$$,'central group correction works');
reset role;

-- Twenty-one further requests from the same company exercise nested pagination.
-- Reset only the fixture's rate-limit window within the rolled-back transaction.
create temporary table group30_inputs as select n,jsonb_build_object('ruc','20300000001','expected_free_count',0,
 'billing',jsonb_build_object('type','boleta','document','30888888','name','Titular'),
 'attendees',jsonb_build_array(jsonb_build_object('document_type','dni','document_number',(30200000+n)::text,'first_names','Persona','last_names','Carga '||n,'email','carga30-'||n||'@example.test','phone','930000000','job_title','Gerente'))) as payload from generate_series(1,21) n;
grant select on group30_inputs to anon;
set local role anon;
select public.register_member_group('30000000-0000-4000-8000-000000000002',payload,gen_random_uuid()) from group30_inputs where n<=19;
reset role;
update public.member_group_submission_limits set window_started_at=now()-interval '2 hours' where company_ruc='20300000001';
set local role anon;
select public.register_member_group('30000000-0000-4000-8000-000000000002',payload,gen_random_uuid()) from group30_inputs where n>19;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','30000000-0000-4000-8000-000000000040',true);
select is((select count(*) from public.get_participation_billing_companies('30000000-0000-4000-8000-000000000002')),1::bigint,'same RUC groups without merging requests');
select is((select request_count from public.get_participation_billing_companies('30000000-0000-4000-8000-000000000002')),22::bigint,'all requests counted per company');
select is((select count(*) from (select id from public.participation_billing_requests where activity_id='30000000-0000-4000-8000-000000000002' and company_key='20300000001' order by created_at,id limit 20 offset 20) page),2::bigint,'company second request page contains remaining two');
select is((select count(*) from public.get_participation_billing_companies('30000000-0000-4000-8000-000000000002','100%_')),0::bigint,'wildcards treated as literal text');
select throws_ok($$select public.get_participation_billing_companies('30000000-0000-4000-8000-000000000002','','all','all',21,0)$$,'22023','VALIDATION_ERROR','company page size fixed at twenty');
reset role;
insert into public.member_companies(ruc,legal_name)
select (20300000001+n)::text,'Empresa de carga '||n from generate_series(1,21) n;
set local role anon;
select public.register_member_group('30000000-0000-4000-8000-000000000002',jsonb_build_object('ruc',(20300000001+n)::text,'expected_free_count',1,'billing',null,
 'attendees',jsonb_build_array(jsonb_build_object('document_type','dni','document_number',(30300000+n)::text,'first_names','Cortesía','last_names','Empresa '||n,'email','empresa30-'||n||'@example.test','phone','930000000','job_title','Gerente'))),gen_random_uuid()) from generate_series(1,21) n;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','30000000-0000-4000-8000-000000000040',true);
select is((select count(*) from public.get_participation_billing_companies('30000000-0000-4000-8000-000000000002')),20::bigint,'company first page is twenty');
select is((select total_count from public.get_participation_billing_companies('30000000-0000-4000-8000-000000000002') limit 1),22::bigint,'company count covers all pages');
select is((select count(*) from public.get_participation_billing_companies('30000000-0000-4000-8000-000000000002','','all','all',20,20)),2::bigint,'company second page contains remaining two');
select is((select count(*) from public.participation_billing_requests where activity_id='30000000-0000-4000-8000-000000000002' and billing_state='not_required'),21::bigint,'fully courtesy requests need no billing');
select throws_ok($$select public.correct_participation_billing('group',(select id from public.participation_billing_requests where activity_id='30000000-0000-4000-8000-000000000002' and company_ruc='20300000002'),'{"type":"boleta","document":"30888888","name":"No agregar"}','Prueba')$$,'P0001','BILLING_DETAILS_NOT_FOUND','no correction form for fully courtesy group');
reset role;
update public.registrations set deleted_at=now() where activity_id='30000000-0000-4000-8000-000000000002' and person_id=(select id from public.people where document_number='30300021');
select is((select count(*) from public.participation_billing_requests where activity_id='30000000-0000-4000-8000-000000000002' and company_ruc='20300000022'),0::bigint,'deleted enrollment excluded from billing');
-- Confirm deferred checks while test fixtures are still present.
set constraints all immediate;
set constraints all deferred;
select throws_ok($$do $body$ begin
 insert into public.registrations(activity_id,person_id,registration_code,price_snapshot,job_title_snapshot)
 values ('30000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000041','CCI-30-BYPASS',60,'Administradora');
 set constraints require_new_registration_billing immediate;
end; $body$;$$,'22023','BILLING_REQUIRED','direct paid insert cannot bypass enforced billing');
set local role authenticated;
select set_config('request.jwt.claim.sub','30000000-0000-4000-8000-000000000041',true);
select is((select count(*) from public.participation_billing_requests),0::bigint,'unprivileged user sees no billing');
select throws_ok($$select public.get_participation_billing_companies('30000000-0000-4000-8000-000000000002')$$,'42501','UNAUTHORIZED','company RPC requires internal account');
reset role;
select * from finish(true);
rollback;
