begin;
select no_plan();

insert into auth.users(id,email) values ('a4100000-0000-4000-8000-000000000001','h18-email-admin@example.test');
insert into public.people(id,document_type,document_number,first_names,last_names,email,phone,job_title) values
('b4100000-0000-4000-8000-000000000001','dni','04100001','Admin','Correo','h18-email-admin@example.test','941000001','Admin');
insert into public.user_accounts(user_id,person_id,role) values
('a4100000-0000-4000-8000-000000000001','b4100000-0000-4000-8000-000000000001','administrator');
insert into public.activities(id,type,title,slug,description,modality,is_free,status) values
('c4100000-0000-4000-8000-000000000001','training','Correo obligatorio H18','h18-email-required','Prueba de correo obligatorio','in_person',true,'draft');
insert into public.speakers(id,first_names,last_names) values
('d4100000-0000-4000-8000-000000000001','Ana','Nueva'),
('d4100000-0000-4000-8000-000000000002','Luis','Pendiente'),
('d4100000-0000-4000-8000-000000000003','María','Histórica');
insert into public.activity_speakers(activity_id,speaker_id) select 'c4100000-0000-4000-8000-000000000001',id
from public.speakers where id in ('d4100000-0000-4000-8000-000000000001','d4100000-0000-4000-8000-000000000002','d4100000-0000-4000-8000-000000000003');
insert into public.certificate_templates(id,name,scope,is_active) values
('e4100000-0000-4000-8000-000000000001','Plantilla correo obligatorio','activity',true);
set local role authenticated;
select set_config('request.jwt.claim.sub','a4100000-0000-4000-8000-000000000001',true);
select public.set_speaker_document('d4100000-0000-4000-8000-000000000001','04181001');
select public.set_speaker_document('d4100000-0000-4000-8000-000000000002','04181002');
select public.set_speaker_document('d4100000-0000-4000-8000-000000000003','04181003');
reset role;

-- Historical fixtures predate mandatory email. Never modify production records.
alter table public.certificates disable trigger require_speaker_certificate_email;
insert into public.certificates(id,activity_id,speaker_id,template_id,certificate_type,recipient_type,
  certificate_code,participant_name_snapshot,title_snapshot,condition_snapshot,file_path,template_snapshot) values
('f4100000-0000-4000-8000-000000000002','c4100000-0000-4000-8000-000000000001','d4100000-0000-4000-8000-000000000002','e4100000-0000-4000-8000-000000000001','activity','speaker','H18-EMAIL-002','Luis Pendiente','Título','Ponente',null,'{}'),
('f4100000-0000-4000-8000-000000000003','c4100000-0000-4000-8000-000000000001','d4100000-0000-4000-8000-000000000003','e4100000-0000-4000-8000-000000000001','activity','speaker','H18-EMAIL-003','María Histórica','Título original','Panelista','issued/legacy-email.pdf','{}');
alter table public.certificates enable trigger require_speaker_certificate_email;
select is(has_function_privilege('anon','public.assert_speaker_certificate_email(uuid)','EXECUTE'),false,'anonymous users cannot inspect private email');
select is(has_function_privilege('authenticated','public.assert_speaker_certificate_email(uuid)','EXECUTE'),false,'private email assertion is internal only');
select ok(public.speaker_certificate_email_is_valid(' persona+certificado@example.test '),'valid email trimmed');
select ok(not public.speaker_certificate_email_is_valid(null),'null email rejected');
select ok(not public.speaker_certificate_email_is_valid(''),'blank email rejected');
select ok(not public.speaker_certificate_email_is_valid('  '),'whitespace email rejected');
select ok(not public.speaker_certificate_email_is_valid('invalido'),'malformed email rejected');
select ok(not public.speaker_certificate_email_is_valid('.persona@example.test'),'leading local dot rejected');
select ok(not public.speaker_certificate_email_is_valid('persona..correo@example.test'),'consecutive dots rejected');
select ok(not public.speaker_certificate_email_is_valid('persona@example.c'),'invalid one-character TLD rejected');
select throws_ok($$insert into public.certificates(activity_id,speaker_id,template_id,certificate_type,recipient_type,certificate_code,participant_name_snapshot,title_snapshot,template_snapshot)
values('c4100000-0000-4000-8000-000000000001','d4100000-0000-4000-8000-000000000001','e4100000-0000-4000-8000-000000000001','activity','speaker','H18-EMAIL-BYPASS','Ana Nueva','Título','{}')$$,
'P0001','SPEAKER_EMAIL_REQUIRED','direct privileged preparation cannot bypass mandatory email');

set local role authenticated;
select throws_ok($$select public.prepare_speaker_certificates('c4100000-0000-4000-8000-000000000001','e4100000-0000-4000-8000-000000000001','[{"speaker_id":"d4100000-0000-4000-8000-000000000001"}]')$$,'P0001','SPEAKER_EMAIL_REQUIRED','RPC requires email before preparation');
select lives_ok($$insert into public.speaker_private_details(speaker_id,email) values('d4100000-0000-4000-8000-000000000001',null)$$,'profile can be saved without email');
select throws_ok($$select public.prepare_speaker_certificates('c4100000-0000-4000-8000-000000000001','e4100000-0000-4000-8000-000000000001','[{"speaker_id":"d4100000-0000-4000-8000-000000000001"}]')$$,'P0001','SPEAKER_EMAIL_REQUIRED','null email cannot issue');
update public.speaker_private_details set email='persona@example.c' where speaker_id='d4100000-0000-4000-8000-000000000001';
select throws_ok($$select public.prepare_speaker_certificates('c4100000-0000-4000-8000-000000000001','e4100000-0000-4000-8000-000000000001','[{"speaker_id":"d4100000-0000-4000-8000-000000000001"}]')$$,'P0001','SPEAKER_EMAIL_REQUIRED','legacy malformed address cannot issue');
select throws_ok($$select public.prepare_speaker_certificates('c4100000-0000-4000-8000-000000000001',null,'[{"speaker_id":"d4100000-0000-4000-8000-000000000002"}]')$$,'P0001','SPEAKER_EMAIL_REQUIRED','pending recovery requires email');
select throws_ok($$select public.claim_speaker_certificate('f4100000-0000-4000-8000-000000000002')$$,'P0001','SPEAKER_EMAIL_REQUIRED','generation lease requires email');
select throws_ok($$select public.finalize_speaker_certificate('f4100000-0000-4000-8000-000000000002','issued/pending.pdf','https://example.test',gen_random_uuid())$$,'P0001','SPEAKER_EMAIL_REQUIRED','finalization requires email');
select lives_ok($$select public.prepare_speaker_certificates('c4100000-0000-4000-8000-000000000001',null,'[{"speaker_id":"d4100000-0000-4000-8000-000000000003"}]')$$,'issued history remains idempotently available without email');
select ok(public.get_public_certificate((select access_token::text from public.certificates where id='f4100000-0000-4000-8000-000000000003'))->>'download_available'='true','historical certificate remains downloadable');
update public.speaker_private_details set email='ponente@example.test' where speaker_id='d4100000-0000-4000-8000-000000000001';
select lives_ok($$select public.prepare_speaker_certificates('c4100000-0000-4000-8000-000000000001','e4100000-0000-4000-8000-000000000001','[{"speaker_id":"d4100000-0000-4000-8000-000000000001"}]')$$,'DNI and valid email allow preparation');
reset role;
create temporary table h18_email_claim(id uuid,token uuid);
grant all on h18_email_claim to authenticated;
set local role authenticated;
insert into h18_email_claim select id,public.claim_speaker_certificate(id) from public.certificates where speaker_id='d4100000-0000-4000-8000-000000000001';
update public.speaker_private_details set email=null where speaker_id='d4100000-0000-4000-8000-000000000001';
select throws_ok($$select public.finalize_speaker_certificate(id,'issued/'||id||'/'||token||'.pdf','https://example.test',token) from h18_email_claim$$,'P0001','SPEAKER_EMAIL_REQUIRED','removing email after claim blocks finalization');
select is((select file_path from public.certificates where id in(select id from h18_email_claim)),null::text,'blocked finalization leaves PDF pending');
select is((select count(*) from public.notification_outbox where related_entity_id in(select id from h18_email_claim)),0::bigint,'blocked finalization does not queue notification');
update public.speaker_private_details set email='actualizado@example.test' where speaker_id='d4100000-0000-4000-8000-000000000001';
select lives_ok($$select public.finalize_speaker_certificate(id,'issued/'||id||'/'||token||'.pdf','https://example.test',token) from h18_email_claim$$,'restoring email allows finalization');
select is((select recipient_email from public.notification_outbox where event_type='speaker_certificate_issued' and related_entity_id in(select id from h18_email_claim)),'actualizado@example.test'::text,'notification uses current email');
select lives_ok($$select public.finalize_speaker_certificate(id,'issued/'||id||'/'||token||'.pdf','https://example.test',token) from h18_email_claim$$,'finalization remains idempotent');
select is((select count(*) from public.notification_outbox where event_type='speaker_certificate_issued' and related_entity_id in(select id from h18_email_claim)),1::bigint,'exactly one outbox entry');
reset role;
select * from finish(true);
rollback;
