begin;
select no_plan();

insert into auth.users(id,email) values
('a4000000-0000-4000-8000-000000000001','h18dni-admin@example.test'),
('a4000000-0000-4000-8000-000000000002','h18dni-operator@example.test'),
('a4000000-0000-4000-8000-000000000003','h18dni-student@example.test'),
('a4000000-0000-4000-8000-000000000004','h18dni-ce@example.test');
insert into public.people(id,document_type,document_number,first_names,last_names,email,phone,job_title) values
('b4000000-0000-4000-8000-000000000001','dni','04000001','Admin','Prueba','h18dni-admin@example.test','940000001','Admin'),
('b4000000-0000-4000-8000-000000000002','dni','04000002','Operator','Prueba','h18dni-operator@example.test','940000002','Operator'),
('b4000000-0000-4000-8000-000000000004','ce','04180001','Otra','Persona','h18dni-ce@example.test','940000004','Estudiante');
insert into public.user_accounts(user_id,person_id,role) values
('a4000000-0000-4000-8000-000000000001','b4000000-0000-4000-8000-000000000001','administrator'),
('a4000000-0000-4000-8000-000000000002','b4000000-0000-4000-8000-000000000002','operator'),
('a4000000-0000-4000-8000-000000000004','b4000000-0000-4000-8000-000000000004','student');
insert into public.activities(id,type,title,slug,description,modality,is_free,status) values
('c4000000-0000-4000-8000-000000000001','training','Historial DNI H18','h18-dni','Prueba de identidad de ponente','in_person',true,'draft'),
('c4000000-0000-4000-8000-000000000002','event','Otro evento H18','h18-dni-event','Prueba de segundo certificado','in_person',true,'draft');
insert into public.speakers(id,first_names,last_names) values
('d4000000-0000-4000-8000-000000000001','Lic. Ana','Catálogo'),
('d4000000-0000-4000-8000-000000000002','Luis','Sin DNI');
insert into public.activity_speakers(activity_id,speaker_id) values
('c4000000-0000-4000-8000-000000000001','d4000000-0000-4000-8000-000000000001'),
('c4000000-0000-4000-8000-000000000001','d4000000-0000-4000-8000-000000000002'),
('c4000000-0000-4000-8000-000000000002','d4000000-0000-4000-8000-000000000001');
insert into public.certificate_templates(id,name,scope,is_active) values
('e4000000-0000-4000-8000-000000000001','Plantilla DNI H18','activity',true);

-- Simulate documents issued/prepared before DNI became mandatory. Fixture only.
alter table public.certificates disable trigger require_speaker_certificate_document;
alter table public.certificates disable trigger require_speaker_certificate_email;
insert into public.certificates(id,activity_id,speaker_id,template_id,certificate_type,recipient_type,
  certificate_code,participant_name_snapshot,title_snapshot,condition_snapshot,file_path,template_snapshot) values
('f4000000-0000-4000-8000-000000000001','c4000000-0000-4000-8000-000000000001','d4000000-0000-4000-8000-000000000001','e4000000-0000-4000-8000-000000000001','activity','speaker','H18-DNI-001','Ana María Completo','Título original','Panelista','issued/h18-dni.pdf','{}'),
('f4000000-0000-4000-8000-000000000002','c4000000-0000-4000-8000-000000000002','d4000000-0000-4000-8000-000000000001','e4000000-0000-4000-8000-000000000001','activity','speaker','H18-DNI-002','Ana María Completo','Evento original','Ponente',null,'{}');
alter table public.certificates enable trigger require_speaker_certificate_document;
alter table public.certificates enable trigger require_speaker_certificate_email;

select is(has_function_privilege('anon','public.set_speaker_document(uuid,text,text,text,boolean)','EXECUTE'),false,'anon cannot register DNI');
select is(has_table_privilege('anon','public.speaker_identity_documents','SELECT'),false,'anon cannot read identity');
select is(has_table_privilege('authenticated','public.speaker_identity_documents','INSERT'),false,'no direct authenticated insert');
select is(has_table_privilege('authenticated','public.speaker_identity_documents','UPDATE'),false,'no direct authenticated correction');
select is(has_table_privilege('authenticated','public.speaker_identity_documents','DELETE'),false,'no direct authenticated delete');
select is(has_table_privilege('service_role','public.speaker_identity_documents','UPDATE'),false,'service role must use audited RPC too');
select is(has_function_privilege('authenticated','public.certificate_identity_ids(uuid,text)','EXECUTE'),false,'identity helper is not a lookup bypass');

set local role service_role;
select is(public.search_public_certificates_by_dni('04180001')->>'status','not_found','legacy certificate not associated before DNI registration');
select ok(public.get_public_certificate((select access_token::text from public.certificates where id='f4000000-0000-4000-8000-000000000001'))->>'participant_name' = 'Ana María Completo','legacy token access works without DNI');
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','a4000000-0000-4000-8000-000000000004',true);
select is((select count(*) from public.speaker_identity_documents),0::bigint,'student RLS hides identity');
select throws_ok($$select public.set_speaker_document('d4000000-0000-4000-8000-000000000001','04180001')$$,'42501','UNAUTHORIZED','student cannot set identity');
select throws_ok($$select public.get_speaker_document_context(array['d4000000-0000-4000-8000-000000000001'::uuid])$$,'42501','UNAUTHORIZED','student cannot read administrative identity context');
select set_config('request.jwt.claim.sub','a4000000-0000-4000-8000-000000000002',true);
select lives_ok($$select public.prepare_speaker_certificates('c4000000-0000-4000-8000-000000000001',null,'[{"speaker_id":"d4000000-0000-4000-8000-000000000001"}]')$$,'already finalized legacy certificate remains idempotently available without DNI');
select throws_ok($$select public.prepare_speaker_certificates('c4000000-0000-4000-8000-000000000001','e4000000-0000-4000-8000-000000000001','[{"speaker_id":"d4000000-0000-4000-8000-000000000002"}]')$$,'P0001','SPEAKER_DOCUMENT_REQUIRED','old client cannot prepare without DNI');
select throws_ok($$select public.prepare_speaker_certificates('c4000000-0000-4000-8000-000000000002',null,'[{"speaker_id":"d4000000-0000-4000-8000-000000000001"}]')$$,'P0001','SPEAKER_DOCUMENT_REQUIRED','pending recovery requires DNI');
select throws_ok($$select public.claim_speaker_certificate('f4000000-0000-4000-8000-000000000002')$$,'P0001','SPEAKER_DOCUMENT_REQUIRED','pending generation lease requires DNI');
select throws_ok($$select public.finalize_speaker_certificate('f4000000-0000-4000-8000-000000000002','issued/fixture.pdf','https://example.test',gen_random_uuid())$$,'P0001','SPEAKER_DOCUMENT_REQUIRED','finalization rechecks DNI');
select throws_ok($$update public.certificates set file_path='issued/bypass.pdf' where id='f4000000-0000-4000-8000-000000000002'$$,'42501','permission denied for table certificates','client cannot write certificate file directly');
reset role;
select throws_ok($$update public.certificates set file_path='issued/bypass.pdf' where id='f4000000-0000-4000-8000-000000000002'$$,'P0001','SPEAKER_DOCUMENT_REQUIRED','database trigger guards privileged file writes too');
set local role authenticated;
select throws_ok($$select public.set_speaker_document('d4000000-0000-4000-8000-000000000001','1234567')$$,'22023','INVALID_SPEAKER_DNI','seven digit DNI rejected');
select throws_ok($$select public.set_speaker_document('d4000000-0000-4000-8000-000000000001','1234567A')$$,'22023','INVALID_SPEAKER_DNI','non numeric DNI rejected');
select ok(public.set_speaker_document('d4000000-0000-4000-8000-000000000002','04180009'),'operator registers DNI before certificates');
select ok(public.set_speaker_document('d4000000-0000-4000-8000-000000000002','04180010','04180009'),'operator can correct before any certificate');
select ok(public.set_speaker_document('d4000000-0000-4000-8000-000000000002','','04180010'),'DNI may be cleared before any certificate');
select ok(public.set_speaker_document('d4000000-0000-4000-8000-000000000001','04180001'),'operator can register initial DNI even with historical certificates');
select is((select document_number from public.speaker_identity_documents where speaker_id='d4000000-0000-4000-8000-000000000001'),'04180001','leading zero preserved');
select is(public.set_speaker_document('d4000000-0000-4000-8000-000000000001','04180001','04180001'),false,'identical save is idempotent');
select throws_ok($$select public.set_speaker_document('d4000000-0000-4000-8000-000000000002','04180001')$$,'23505','SPEAKER_DOCUMENT_CONFLICT','duplicate DNI rejected');
select throws_ok($$select public.create_speaker_with_document('{"first_names":"Nuevo","last_names":"Duplicado"}','04180001')$$,'23505','SPEAKER_DOCUMENT_CONFLICT','creation and initial DNI are atomic');
select is((select count(*) from public.speakers where first_names='Nuevo' and last_names='Duplicado'),0::bigint,'conflict leaves no orphan profile');
select lives_ok($$select public.create_speaker_with_document('{"first_names":"Nuevo","last_names":"Sin documento"}')$$,'catalog profile may be saved without DNI');
select throws_ok($$select public.set_speaker_document('d4000000-0000-4000-8000-000000000001','04180002','04180001','Corrección de prueba',true)$$,'42501','SPEAKER_DOCUMENT_ADMIN_REQUIRED','operator cannot transfer history');
select throws_ok($$select public.set_speaker_document('d4000000-0000-4000-8000-000000000001','','04180001')$$,'P0001','SPEAKER_DOCUMENT_REQUIRED','cannot delete DNI with history');
select ok((select not can_correct from public.get_speaker_document_context(array['d4000000-0000-4000-8000-000000000001'::uuid])),'operator receives readonly existing DNI');

reset role;
set local role service_role;
create temporary table h18dni_lookup as select public.search_public_certificates_by_dni('04180001','203.0.113.140','pgTAP') as result;
select is((select jsonb_array_length(result->'certificates') from h18dni_lookup),1,'historical finalized PDF found without people or account');
select is((select result->'certificates'->0->>'recipient_type' from h18dni_lookup),'speaker','public result identifies speaker');
select is((select result->'certificates'->0->>'participant_name' from h18dni_lookup),'Ana María Completo','public result preserves printed name');
select ok((select not (result->'certificates'->0 ? 'document_number') from h18dni_lookup),'result does not expose private DNI');
reset role;

-- Creating the account later associates finalized history without changing the PDF.
insert into public.people(id,document_type,document_number,first_names,last_names,email,phone,job_title) values
('b4000000-0000-4000-8000-000000000003','dni','04180001','Nombre','Del Campus','h18dni-student@example.test','940000003','Estudiante');
insert into public.user_accounts(user_id,person_id,role) values
('a4000000-0000-4000-8000-000000000003','b4000000-0000-4000-8000-000000000003','student');
insert into public.registrations(id,activity_id,person_id,registration_code,status,confirmed_at,job_title_snapshot) values
('94000000-0000-4000-8000-000000000001','c4000000-0000-4000-8000-000000000001','b4000000-0000-4000-8000-000000000003','H18-DNI-REG','confirmed',now(),'Estudiante');
insert into public.certificates(id,person_id,registration_id,template_id,certificate_type,certificate_code,participant_name_snapshot,title_snapshot,file_path) values
('f4000000-0000-4000-8000-000000000003','b4000000-0000-4000-8000-000000000003','94000000-0000-4000-8000-000000000001','e4000000-0000-4000-8000-000000000001','activity','H18-DNI-PART','Nombre Participante','Participación','issued/h18-part.pdf');
set local role service_role;
select is(jsonb_array_length(public.search_public_certificates_by_dni('04180001')->'certificates'),2,'public query combines participant and speaker once each');
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','a4000000-0000-4000-8000-000000000003',true);
select is(jsonb_array_length(public.get_my_certificates()),2,'Campus combines participant and speaker without duplicates');
select is((select count(*) from public.speaker_identity_documents),0::bigint,'even matching Campus user cannot read populated identity table');
reset role;
update public.certificates set deleted_at=now() where id='f4000000-0000-4000-8000-000000000003';
set local role authenticated;
select is(jsonb_array_length(public.get_my_certificates()),1,'later Campus account receives historical certificate');
select is(public.get_my_certificates()->0->>'participant_name','Ana María Completo','Campus uses printed snapshot not account name');
select set_config('request.jwt.claim.sub','a4000000-0000-4000-8000-000000000004',true);
select is(jsonb_array_length(public.get_my_certificates()),0,'CE with same numeric value cannot claim DNI history');
select set_config('request.jwt.claim.sub','a4000000-0000-4000-8000-000000000002',true);
select is(jsonb_array_length(public.get_my_certificates()),0,'different DNI cannot claim history');

select set_config('request.jwt.claim.sub','a4000000-0000-4000-8000-000000000001',true);
select throws_ok($$select public.set_speaker_document('d4000000-0000-4000-8000-000000000001','04180002','04180001','',true)$$,'22023','SPEAKER_DOCUMENT_CONFIRMATION_REQUIRED','administrator must explain correction');
select throws_ok($$select public.set_speaker_document('d4000000-0000-4000-8000-000000000001','04180002','04180001','Corrección verificada',false)$$,'22023','SPEAKER_DOCUMENT_CONFIRMATION_REQUIRED','administrator must confirm history transfer');
select ok(public.set_speaker_document('d4000000-0000-4000-8000-000000000001','04180002','04180001','Corrección verificada',true),'administrator can transfer history');
select throws_ok($$select public.set_speaker_document('d4000000-0000-4000-8000-000000000001','04180003','04180001','Intento obsoleto',true)$$,'40001','SPEAKER_DOCUMENT_CHANGED','stale correction rejected');
select lives_ok($$update public.speakers set first_names='Perfil actualizado' where id='d4000000-0000-4000-8000-000000000001'$$,'catalog name remains independently editable');
select lives_ok($$insert into public.speaker_private_details(speaker_id,email,phone) values('d4000000-0000-4000-8000-000000000001','otro@example.test','940000005') on conflict(speaker_id) do update set email=excluded.email,phone=excluded.phone$$,'contact edits independent of identity');
select is((select document_number from public.speaker_identity_documents where speaker_id='d4000000-0000-4000-8000-000000000001'),'04180002','contact and name edits preserve DNI');
select is((select file_path from public.certificates where id='f4000000-0000-4000-8000-000000000001'),'issued/h18-dni.pdf','correction does not regenerate PDF');
select is((select participant_name_snapshot from public.certificates where id='f4000000-0000-4000-8000-000000000001'),'Ana María Completo','correction preserves certificate name');
select ok(public.get_public_certificate((select access_token::text from public.certificates where id='f4000000-0000-4000-8000-000000000001'))->>'certificate_code'='H18-DNI-001','original token and code still resolve after correction');
reset role;
select is((select count(*) from public.audit_logs where action='speaker.document_registered' and entity_id='d4000000-0000-4000-8000-000000000001'),1::bigint,'initial registration audited once');
select ok(exists(select 1 from public.audit_logs where action='speaker.document_corrected' and entity_id='d4000000-0000-4000-8000-000000000001'
  and actor_user_id='a4000000-0000-4000-8000-000000000001' and old_data->>'document_number'='04180001'
  and new_data->>'document_number'='04180002' and new_data->>'reason'='Corrección verificada'),'correction audit includes actor, previous/new identity and reason');
set local role service_role;
select is(public.search_public_certificates_by_dni('04180001')->>'status','not_found','old DNI loses speaker history');
select is(jsonb_array_length(public.search_public_certificates_by_dni('04180002')->'certificates'),1,'new DNI gains finalized history');
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','a4000000-0000-4000-8000-000000000003',true);
select is(jsonb_array_length(public.get_my_certificates()),0,'old Campus account loses corrected history');
reset role;
update public.speakers set is_active=false where id='d4000000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub','a4000000-0000-4000-8000-000000000002',true);
select throws_ok($$select public.set_speaker_document('d4000000-0000-4000-8000-000000000002','04180002')$$,'23505','SPEAKER_DOCUMENT_CONFLICT','inactive profile still reserves DNI');
reset role;
update public.certificates set status='revoked',revoked_at=now(),revocation_reason='Prueba' where id='f4000000-0000-4000-8000-000000000001';
set local role service_role;
select is(public.search_public_certificates_by_dni('04180002')->'certificates'->0->>'status','revoked','revoked document stays in lookup');
select is(public.search_public_certificates_by_dni('04180002')->'certificates'->0->>'download_available','false','revoked document cannot download');
select is(public.get_public_certificate_file((select access_token::text from public.certificates where id='f4000000-0000-4000-8000-000000000001')),null::text,'secure download refuses revoked certificate');
reset role;
update public.activities set status='archived' where id='c4000000-0000-4000-8000-000000000001';
set local role service_role;
select is(public.search_public_certificates_by_dni('04180002')->>'status','not_found','archived activities stay excluded');
reset role;

select * from finish(true);
rollback;
