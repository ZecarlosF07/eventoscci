begin;
select no_plan();
select is(has_function_privilege('anon','public.replace_activity_certificate_hours(uuid,uuid,numeric,text,text)','EXECUTE'),false,'anonymous users cannot correct certificate hours');
insert into auth.users(id,email) values
 ('34000000-0000-4000-8000-000000000001','admin34@example.test'),
 ('34000000-0000-4000-8000-000000000002','student34@example.test');
insert into public.people(id,document_type,document_number,first_names,last_names,email,phone,job_title) values
 ('34000000-0000-4000-8000-000000000010','dni','34100010','Admin','Horas','admin34@example.test','934000010','Administradora'),
 ('34000000-0000-4000-8000-000000000011','dni','34100011','Alumno','Horas','student34@example.test','934000011','Estudiante');
insert into public.user_accounts(user_id,person_id,role) values
 ('34000000-0000-4000-8000-000000000001','34000000-0000-4000-8000-000000000010','administrator'),
 ('34000000-0000-4000-8000-000000000002','34000000-0000-4000-8000-000000000011','student');
insert into public.activities(id,type,title,slug,description,modality,is_free,status,certificate_mode,academic_hours) values
 ('34000000-0000-4000-8000-000000000020','event','Horas de prueba','horas-34','Prueba de corrección','in_person',true,'draft','included',3),
 ('34000000-0000-4000-8000-000000000021','training','Otra actividad','horas-34-otra','Prueba de corrección','in_person',true,'draft','none',null);
select throws_ok($$update public.activities set academic_hours=0 where id='34000000-0000-4000-8000-000000000020'$$,'22023','ACADEMIC_HOURS_REQUIRED','included certificates reject zero hours');
select throws_ok($$update public.activities set academic_hours=null where id='34000000-0000-4000-8000-000000000020'$$,'22023','ACADEMIC_HOURS_REQUIRED','included certificates require hours');
select throws_ok($$update public.activities set certificate_mode='optional_paid',certificate_general_price=10,certificate_member_price=10,academic_hours=0 where id='34000000-0000-4000-8000-000000000020'$$,'22023','ACADEMIC_HOURS_REQUIRED','optional certificates reject zero hours');
select lives_ok($$update public.activities set title='Título editado' where id='34000000-0000-4000-8000-000000000021'$$,'activities without certificates may omit hours');
insert into public.registrations(id,activity_id,person_id,registration_code,status,confirmed_at,certificate_mode_snapshot,job_title_snapshot) values
 ('34000000-0000-4000-8000-000000000030','34000000-0000-4000-8000-000000000020','34000000-0000-4000-8000-000000000010','CCI-REG-34-UNO','confirmed',now(),'included','Participante'),
 ('34000000-0000-4000-8000-000000000031','34000000-0000-4000-8000-000000000020','34000000-0000-4000-8000-000000000011','CCI-REG-34-DOS','confirmed',now(),'included','Participante');
insert into public.attendance(registration_id,status,marked_at) values ('34000000-0000-4000-8000-000000000030','attended',now()),('34000000-0000-4000-8000-000000000031','attended',now());
-- Represent an already-issued historical certificate with an incorrect hours snapshot.
insert into public.certificates(id,person_id,template_id,registration_id,certificate_type,certificate_code,participant_name_snapshot,title_snapshot,academic_hours_snapshot,file_path,access_token,issued_at,condition_snapshot,date_text_snapshot) values
 ('34000000-0000-4000-8000-000000000040','34000000-0000-4000-8000-000000000010','c5000000-0000-4000-8000-000000000001','34000000-0000-4000-8000-000000000030','activity','CCI-CERT-34','Nombre histórico','Título histórico',0,'issued/34000000-0000-4000-8000-000000000040/old.pdf','34000000-0000-4000-8000-000000000050','2026-09-01T12:00:00Z','Participó','01/09/2026');
create temporary table old34 as select * from public.certificates where id='34000000-0000-4000-8000-000000000040';
grant select on old34 to authenticated;
set local role authenticated;
select set_config('request.jwt.claim.sub','34000000-0000-4000-8000-000000000002',true);
select throws_ok($$select public.replace_activity_certificate_hours('34000000-0000-4000-8000-000000000040','34000000-0000-4000-8000-000000000020',3,'issued/34000000-0000-4000-8000-000000000040/old.pdf','issued/34000000-0000-4000-8000-000000000040/new.pdf')$$,'42501','UNAUTHORIZED','students cannot regenerate hours');
select set_config('request.jwt.claim.sub','34000000-0000-4000-8000-000000000001',true);
select throws_ok($$select public.replace_activity_certificate_hours('34000000-0000-4000-8000-000000000040','34000000-0000-4000-8000-000000000020',0,'issued/34000000-0000-4000-8000-000000000040/old.pdf','issued/34000000-0000-4000-8000-000000000040/new.pdf')$$,'22023','VALIDATION_ERROR','correction rejects zero hours');
select throws_ok($$select public.replace_activity_certificate_hours('34000000-0000-4000-8000-000000000040','34000000-0000-4000-8000-000000000020',4,'issued/34000000-0000-4000-8000-000000000040/old.pdf','issued/34000000-0000-4000-8000-000000000040/new.pdf')$$,'40001','ACTIVITY_HOURS_CHANGED','changed activity hours require reloading');
select throws_ok($$select public.replace_activity_certificate_hours('34000000-0000-4000-8000-000000000040','34000000-0000-4000-8000-000000000020',3,'issued/34000000-0000-4000-8000-000000000040/stale.pdf','issued/34000000-0000-4000-8000-000000000040/new.pdf')$$,'40001','CERTIFICATE_CHANGED','stale file cannot overwrite another correction');
select throws_ok($$select public.replace_activity_certificate_hours('34000000-0000-4000-8000-000000000040','34000000-0000-4000-8000-000000000020',3,'issued/34000000-0000-4000-8000-000000000040/old.pdf','issued/another-id/new.pdf')$$,'22023','VALIDATION_ERROR','replacement path must belong to the certificate');
select lives_ok($$select public.replace_activity_certificate_hours('34000000-0000-4000-8000-000000000040','34000000-0000-4000-8000-000000000020',3,'issued/34000000-0000-4000-8000-000000000040/old.pdf','issued/34000000-0000-4000-8000-000000000040/new.pdf')$$,'admin explicitly corrects historical hours');
select is((select academic_hours_snapshot from public.certificates where id='34000000-0000-4000-8000-000000000040'),3::numeric,'hours snapshot corrected');
select is((select to_jsonb(c)-'academic_hours_snapshot'-'file_path'-'updated_at' from public.certificates c where id='34000000-0000-4000-8000-000000000040'),(select to_jsonb(o)-'academic_hours_snapshot'-'file_path'-'updated_at' from old34 o),'identity, issue date, name, title and remaining snapshots unchanged');
select is((select count(*) from public.notification_outbox where related_entity_id='34000000-0000-4000-8000-000000000040'),0::bigint,'hours correction sends no notification');
reset role;
select is((select count(*) from public.audit_logs where action='certificate.hours_corrected' and entity_id='34000000-0000-4000-8000-000000000040'),1::bigint,'hours correction audited');
-- Simulate a legacy activity before the new hours trigger existed.
set constraints all immediate;
alter table public.activities disable trigger validate_activity_certificate_hours;
update public.activities set academic_hours=0 where id='34000000-0000-4000-8000-000000000020';
set constraints all immediate;
alter table public.activities enable trigger validate_activity_certificate_hours;
set local role authenticated;
select is(public.prepare_activity_certificates(array['34000000-0000-4000-8000-000000000031'::uuid],'c5000000-0000-4000-8000-000000000001','Participó')->'rejected'->0->>'reason','ACADEMIC_HOURS_REQUIRED','new issuance rejects legacy zero hours');
reset role;
update public.activities set academic_hours=3 where id='34000000-0000-4000-8000-000000000020';
set local role authenticated;
select lives_ok($$select public.prepare_activity_certificates(array['34000000-0000-4000-8000-000000000031'::uuid],'c5000000-0000-4000-8000-000000000001','Participó')$$,'new issuance accepts corrected positive hours');
reset role;
select is((select academic_hours_snapshot from public.certificates where registration_id='34000000-0000-4000-8000-000000000031'),3::numeric,'new certificate has positive hours');
update public.certificates set status='revoked',revoked_at=now(),revocation_reason='Prueba' where id='34000000-0000-4000-8000-000000000040';
set local role authenticated;
select throws_ok($$select public.replace_activity_certificate_hours('34000000-0000-4000-8000-000000000040','34000000-0000-4000-8000-000000000020',3,'issued/34000000-0000-4000-8000-000000000040/new.pdf','issued/34000000-0000-4000-8000-000000000040/another.pdf')$$,'P0001','CERTIFICATE_NOT_ISSUED','revoked certificates cannot be corrected');
select * from finish(true);
rollback;
