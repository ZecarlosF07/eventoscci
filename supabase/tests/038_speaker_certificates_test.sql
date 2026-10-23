begin;
select no_plan();

insert into auth.users(id,email) values
('a1800000-0000-4000-8000-000000000001','h18-admin@example.test'),
('a1800000-0000-4000-8000-000000000002','h18-student@example.test');
insert into public.people(id,document_type,document_number,first_names,last_names,email,phone,job_title) values
('b1800000-0000-4000-8000-000000000001','dni','18000001','Admin','Prueba','h18-admin@example.test','918000001','Admin'),
('b1800000-0000-4000-8000-000000000002','dni','18000002','Alumno','Prueba','h18-student@example.test','918000002','Alumno');
insert into public.user_accounts(user_id,person_id,role) values
('a1800000-0000-4000-8000-000000000001','b1800000-0000-4000-8000-000000000001','administrator'),
('a1800000-0000-4000-8000-000000000002','b1800000-0000-4000-8000-000000000002','student');
insert into public.activities(id,type,title,slug,description,modality,is_free,status,certificate_mode)
values ('c1800000-0000-4000-8000-000000000001','training','Actividad de ponentes','h18-ponentes','Prueba de certificados de ponentes','virtual',true,'draft','none');
insert into public.speakers(id,first_names,last_names) values
('d1800000-0000-4000-8000-000000000001','Ana','Ponente'),
('d1800000-0000-4000-8000-000000000002','Luis','Manual');
insert into public.speaker_private_details(speaker_id,email) values
('d1800000-0000-4000-8000-000000000001','ponente@example.test'),
('d1800000-0000-4000-8000-000000000002','segundo-ponente@example.test');
insert into public.activity_speakers(activity_id,speaker_id,role_label) values
('c1800000-0000-4000-8000-000000000001','d1800000-0000-4000-8000-000000000001','Panelista'),
('c1800000-0000-4000-8000-000000000001','d1800000-0000-4000-8000-000000000002',null);

select is(has_function_privilege('anon','public.prepare_speaker_certificates(uuid,uuid,jsonb)','EXECUTE'),false,'anon cannot prepare');
set local role authenticated;
select set_config('request.jwt.claim.sub','a1800000-0000-4000-8000-000000000002',true);
select throws_ok($$select public.get_speaker_certificate_candidates('c1800000-0000-4000-8000-000000000001')$$,'42501','UNAUTHORIZED','student rejected');
select set_config('request.jwt.claim.sub','a1800000-0000-4000-8000-000000000001',true);
select public.set_speaker_document('d1800000-0000-4000-8000-000000000001','01800001');
select public.set_speaker_document('d1800000-0000-4000-8000-000000000002','01800002');
select is((select role_label from public.get_speaker_certificate_candidates('c1800000-0000-4000-8000-000000000001') where speaker_id='d1800000-0000-4000-8000-000000000002'),'Ponente','role fallback');
select lives_ok($$select public.prepare_speaker_certificates('c1800000-0000-4000-8000-000000000001','c5000000-0000-4000-8000-000000000001','[{"speaker_id":"d1800000-0000-4000-8000-000000000001","role":"Panelista","full_name":"  Ana María Ponente Completo  "},{"speaker_id":"d1800000-0000-4000-8000-000000000002","role":"Ponente"}]')$$,'prepare without attendance or payment');
select is((select participant_name_snapshot from public.certificates where speaker_id='d1800000-0000-4000-8000-000000000001'),'Ana María Ponente Completo','custom name is trimmed and stored');
select is((select first_names from public.speakers where id='d1800000-0000-4000-8000-000000000001'),'Ana'::varchar,'catalog name is unchanged');
select is((select participant_name_snapshot from public.certificates where speaker_id='d1800000-0000-4000-8000-000000000002'),'Luis Manual','legacy payload defaults to catalog name');
select throws_ok($$select public.prepare_speaker_certificates('c1800000-0000-4000-8000-000000000001',null,'[{"speaker_id":"d1800000-0000-4000-8000-000000000001","role":"Ponente","full_name":" "}]')$$,'22023','VALIDATION_ERROR','blank name is rejected');
select lives_ok($$select public.prepare_speaker_certificates('c1800000-0000-4000-8000-000000000001',null,'[{"speaker_id":"d1800000-0000-4000-8000-000000000001","role":"Ponente","full_name":"Otro nombre"}]')$$,'repeat request accepts its original certificate');
select is((select participant_name_snapshot from public.certificates where speaker_id='d1800000-0000-4000-8000-000000000001'),'Ana María Ponente Completo','retry never overwrites frozen name');
select lives_ok($$select public.prepare_speaker_certificates('c1800000-0000-4000-8000-000000000001','c5000000-0000-4000-8000-000000000001','[{"speaker_id":"d1800000-0000-4000-8000-000000000001","role":"Otro"}]')$$,'idempotent prepare');
select is((select pending_count from public.get_speaker_certificate_activity_summaries('Actividad de ponentes')),2::bigint,'prepared PDFs remain pending in summary');
select lives_ok($$select public.prepare_speaker_certificates('c1800000-0000-4000-8000-000000000001',null,'[{"speaker_id":"d1800000-0000-4000-8000-000000000001","role":"Otro"}]')$$,'recover with frozen template even without active selection');
select is((select count(*) from public.certificates where activity_id='c1800000-0000-4000-8000-000000000001'),2::bigint,'one per activity speaker');
select ok((select bool_and(person_id is null and registration_id is null and academic_hours_snapshot is null and template_snapshot is not null) from public.certificates where activity_id='c1800000-0000-4000-8000-000000000001'),'origins and snapshots');
select is((select condition_snapshot from public.certificates where speaker_id='d1800000-0000-4000-8000-000000000001'),'Panelista','retry preserves snapshot');
reset role;
create temp table h18_claims as select id, speaker_id, public.claim_speaker_certificate(id) as token from public.certificates where false;
grant all on h18_claims to authenticated;
set local role authenticated;
select set_config('request.jwt.claim.sub','a1800000-0000-4000-8000-000000000001',true);
insert into h18_claims select id,speaker_id,public.claim_speaker_certificate(id) from public.certificates where activity_id='c1800000-0000-4000-8000-000000000001';
select is((select public.claim_speaker_certificate(id) from h18_claims limit 1),null::uuid,'concurrent generation blocked');
select lives_ok($$select public.finalize_speaker_certificate(id,'issued/'||id||'/'||token||'.pdf','https://example.test',token) from h18_claims$$,'finalize');
select is((select count(*) from public.notification_outbox where event_type='speaker_certificate_issued' and related_entity_id in (select id from h18_claims)),2::bigint,'each issued speaker certificate queues its email');
select lives_ok($$select public.finalize_speaker_certificate(id,'issued/'||id||'/'||token||'.pdf','https://example.test',token) from h18_claims$$,'finalize idempotent');
select is((select count(*) from public.notification_outbox where event_type='speaker_certificate_issued' and related_entity_id in (select id from h18_claims)),2::bigint,'no duplicate notification');
select is((select issued_count from public.get_speaker_certificate_activity_summaries('Actividad de ponentes')),2::bigint,'summary counts completed PDFs');
select lives_ok($$select public.replace_speaker_certificate_file(id,'issued/'||id||'/'||token||'.pdf','issued/'||id||'/regenerated.pdf') from h18_claims$$,'regenerate with expected path');
select throws_ok($$select public.replace_speaker_certificate_file(id,'issued/'||id||'/'||token||'.pdf','issued/'||id||'/regenerated-two.pdf') from h18_claims limit 1$$,'40001','CERTIFICATE_CHANGED','stale regeneration rejected');
select ok((select public.get_public_certificate(access_token::text)->>'recipient_type'='speaker' from public.certificates where id in (select id from h18_claims) limit 1),'token access');
reset role;
update public.activity_speakers set deleted_at=now() where activity_id='c1800000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub','a1800000-0000-4000-8000-000000000001',true);
select is((select count(*) from public.get_speaker_certificate_candidates('c1800000-0000-4000-8000-000000000001')),2::bigint,'issued certificates survive unlink');
select lives_ok($$select public.revoke_certificate((select id from h18_claims limit 1),'Prueba de revocación')$$,'revocation');
reset role;
update public.activities set status='archived' where id='c1800000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub','a1800000-0000-4000-8000-000000000001',true);
select throws_ok($$select public.prepare_speaker_certificates('c1800000-0000-4000-8000-000000000001','c5000000-0000-4000-8000-000000000001','[{"speaker_id":"d1800000-0000-4000-8000-000000000001","role":"Ponente"}]')$$,'P0001','ACTIVITY_ARCHIVED','archive blocks writes');
select * from finish();
rollback;
