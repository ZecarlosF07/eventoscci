begin;
select no_plan();
select is(has_table_privilege('anon','public.admin_registration_records','SELECT'),false,'anonymous cannot search registrations');
select is(has_function_privilege('anon','public.get_activity_certificate_candidates_filtered(uuid,text,integer,integer,text)','EXECUTE'),false,'anonymous cannot filter certificates');
select ok((select reloptions @> array['security_invoker=true'] from pg_class where oid='public.admin_registration_records'::regclass),'search view preserves caller RLS');
select is('Empresa 100%_X' ilike public.admin_literal_pattern('100%_X'),true,'percent and underscore searchable literally');
select is('Empresa 100ABX' ilike public.admin_literal_pattern('100%_X'),false,'wildcards cannot expand search');
select is('Empresa A,B (C)' ilike public.admin_literal_pattern('A,B (C)'),true,'punctuation is preserved');

insert into auth.users(id,email) values ('29000000-0000-4000-8000-000000000040','admin29@example.test');
insert into public.people(id,document_type,document_number,first_names,last_names,email,phone,job_title,company,ruc)
values ('29000000-0000-4000-8000-000000000041','dni','29100041','Ana María','Filtro Completo','admin29@example.test','929000041','Administradora','Empresa 100%_X','20999999991');
insert into public.people(id,document_type,document_number,first_names,last_names,email,phone,participant_profile,academic_institution,career)
values ('29000000-0000-4000-8000-000000000042','dni','29100042','Estudiante','Filtros','student29@example.test','929000042','student','Universidad Prueba','Ingeniería');
insert into public.user_accounts(user_id,person_id,role) values ('29000000-0000-4000-8000-000000000040','29000000-0000-4000-8000-000000000041','administrator');
insert into public.activities(id,type,title,slug,description,modality,is_free,certificate_mode,certificate_general_price,certificate_member_price,status,published_at,maps_embed_url,contact_phone)
values
 ('29000000-0000-4000-8000-000000000001','event','Incluido filtros','incluido-filtros-29','Prueba','in_person',true,'included',0,0,'published',now(),'https://www.google.com/maps/embed?pb=29','900000029'),
 ('29000000-0000-4000-8000-000000000002','training','Opcional filtros','opcional-filtros-29','Prueba','in_person',true,'optional_paid',20,10,'published',now(),'https://www.google.com/maps/embed?pb=29','900000029');
insert into public.registrations(id,activity_id,person_id,registration_code,registration_type,status,confirmed_at,job_title_snapshot,participant_profile,academic_institution_snapshot,career_snapshot,company_snapshot,ruc_snapshot)
values
 ('29000000-0000-4000-8000-000000000011','29000000-0000-4000-8000-000000000001','29000000-0000-4000-8000-000000000041','CCI-29-011','general','confirmed',now(),'Administradora','professional',null,null,'Empresa histórica','20999999992'),
 ('29000000-0000-4000-8000-000000000012','29000000-0000-4000-8000-000000000001','29000000-0000-4000-8000-000000000042','CCI-29-012','general','confirmed',now(),null,'student','Universidad Histórica','Medicina',null,null),
 ('29000000-0000-4000-8000-000000000013','29000000-0000-4000-8000-000000000002','29000000-0000-4000-8000-000000000041','CCI-29-013','general','confirmed',now(),'Administradora','professional',null,null,null,null);
select is((select count(*) from public.admin_registration_records where activity_id='29000000-0000-4000-8000-000000000001' and search_text ilike public.admin_literal_pattern('Ana María Filtro Completo')),1::bigint,'full name searches joined registrations');
select is((select count(*) from public.admin_registration_records where activity_id='29000000-0000-4000-8000-000000000001' and search_text ilike public.admin_literal_pattern('20999999992')),1::bigint,'company snapshot RUC searches');
select is((select count(*) from public.admin_registration_records where activity_id='29000000-0000-4000-8000-000000000001' and participant_profile='student'),1::bigint,'student filter independent of general registration');
select is((select count(*) from public.people where id='29000000-0000-4000-8000-000000000042' and admin_search_text ilike public.admin_literal_pattern('Ingeniería')),1::bigint,'directory searches academic career');
select is((select count(*) from public.admin_registration_records where activity_id='29000000-0000-4000-8000-000000000001' and search_text ilike public.admin_literal_pattern('CCI-29-012')),1::bigint,'registration code searches');
insert into public.attendance(registration_id,status) values
 ('29000000-0000-4000-8000-000000000011','pending'),
 ('29000000-0000-4000-8000-000000000012','pending'),
 ('29000000-0000-4000-8000-000000000013','pending');
update public.attendance set status='attended',marked_at=now(),marked_by='29000000-0000-4000-8000-000000000040'
where registration_id in ('29000000-0000-4000-8000-000000000011','29000000-0000-4000-8000-000000000013');
set local role authenticated;
select set_config('request.jwt.claim.sub','29000000-0000-4000-8000-000000000040',true);
select is((select count(*) from public.get_activity_certificate_candidates_filtered('29000000-0000-4000-8000-000000000001',null,20,0,'ready')),1::bigint,'included and attended ready for issuance');
select is((select count(*) from public.get_activity_certificate_candidates_filtered('29000000-0000-4000-8000-000000000001',null,20,0,'all')),2::bigint,'all candidates retained');
select is((select count(*) from public.get_activity_certificate_candidates_filtered('29000000-0000-4000-8000-000000000002',null,20,0,'ready')),0::bigint,'optional unpaid not ready');
select lives_ok($$select public.register_activity_certificate_request_admin('29000000-0000-4000-8000-000000000013')$$,'certificate request can be recorded');
select lives_ok($$select public.verify_activity_certificate_payment('29000000-0000-4000-8000-000000000013')$$,'certificate payment validates separately');
select is((select count(*) from public.get_activity_certificate_candidates_filtered('29000000-0000-4000-8000-000000000002',null,20,0,'ready')),1::bigint,'optional paid and attended becomes ready');
select is((select count(*) from public.get_activity_certificate_candidates('29000000-0000-4000-8000-000000000001',null,20,0)),2::bigint,'old RPC remains compatible');
select is((select count(*) from public.get_activity_certificate_candidates_filtered('29000000-0000-4000-8000-000000000001','100%_X',20,0,'all')),0::bigint,'candidate search is limited to documented identity fields');
select throws_ok($$select public.get_activity_certificate_candidates_filtered('29000000-0000-4000-8000-000000000001',null,20,0,'invalid')$$,'22023','VALIDATION_ERROR','invalid emission filter rejected');
select throws_ok($$select public.get_activity_certificate_candidates_filtered('29000000-0000-4000-8000-000000000001',null,20,0,null)$$,'22023','VALIDATION_ERROR','null emission filter rejected');
select throws_ok($$select public.get_activity_certificate_candidates_filtered('29000000-0000-4000-8000-000000000001',null,101,0,'all')$$,'22023','VALIDATION_ERROR','oversized page rejected rather than truncated');
select is((select total_count from public.get_activity_certificate_candidates_filtered('29000000-0000-4000-8000-000000000001',null,1,1,'all')),2::bigint,'second page retains complete filtered count');
reset role;
insert into public.certificate_templates(id,name,scope,is_active,is_default) values ('29000000-0000-4000-8000-000000000060','Plantilla 29','activity',true,false);
insert into public.certificates(id,person_id,template_id,registration_id,certificate_type,certificate_code,participant_name_snapshot,title_snapshot,issued_by)
values ('29000000-0000-4000-8000-000000000061','29000000-0000-4000-8000-000000000041','29000000-0000-4000-8000-000000000060','29000000-0000-4000-8000-000000000011','activity','CCI-CERT-29','Ana María Filtro Completo','Incluido filtros','29000000-0000-4000-8000-000000000040');
set local role authenticated;
select is((select count(*) from public.get_activity_certificate_candidates_filtered('29000000-0000-4000-8000-000000000001',null,20,0,'issued')),1::bigint,'issued filter');
select is((select count(*) from public.get_activity_certificate_candidates_filtered('29000000-0000-4000-8000-000000000001',null,20,0,'ready')),0::bigint,'issued no longer ready');
select lives_ok($$select public.revoke_certificate('29000000-0000-4000-8000-000000000061','Prueba de filtro')$$,'revoke test fixture');
select is((select count(*) from public.get_activity_certificate_candidates_filtered('29000000-0000-4000-8000-000000000001',null,20,0,'revoked')),1::bigint,'revoked filter');
select set_config('request.jwt.claim.sub','29000000-0000-4000-8000-000000000042',true);
select throws_ok($$select public.get_activity_certificate_candidates_filtered('29000000-0000-4000-8000-000000000001',null,20,0,'all')$$,'42501','UNAUTHORIZED','unprivileged identity cannot filter candidates');
reset role;
select * from finish(true);
rollback;
