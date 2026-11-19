begin;
select no_plan();

select is(has_function_privilege('anon',
  'public.replace_activity_certificate_details(uuid,uuid,numeric,text,text,text)', 'EXECUTE'),
  false, 'anonymous users cannot correct title and hours');

insert into auth.users(id,email) values
 ('45000000-0000-4000-8000-000000000001','admin45@example.test'),
 ('45000000-0000-4000-8000-000000000002','student45@example.test'),
 ('45000000-0000-4000-8000-000000000003','operator45@example.test');
insert into public.people(id,document_type,document_number,first_names,last_names,email,phone,job_title) values
 ('45000000-0000-4000-8000-000000000010','dni','45100010','Admin','Prueba','admin45@example.test','945000010','Administración'),
 ('45000000-0000-4000-8000-000000000011','dni','45100011','Alumno','Prueba','student45@example.test','945000011','Estudiante'),
 ('45000000-0000-4000-8000-000000000012','dni','45100012','Operador','Prueba','operator45@example.test','945000012','Operador');
insert into public.user_accounts(user_id,person_id,role) values
 ('45000000-0000-4000-8000-000000000001','45000000-0000-4000-8000-000000000010','administrator'),
 ('45000000-0000-4000-8000-000000000002','45000000-0000-4000-8000-000000000011','student'),
 ('45000000-0000-4000-8000-000000000003','45000000-0000-4000-8000-000000000012','operator');
insert into public.activities(id,type,title,slug,description,modality,is_free,status,certificate_mode,academic_hours) values
 ('45000000-0000-4000-8000-000000000020','training','Título actualizado','datos-45','Prueba de corrección','in_person',true,'draft','included',125),
 ('45000000-0000-4000-8000-000000000021','event','Título actualizado','datos-45-otra','Otra actividad','in_person',true,'draft','included',125);
insert into public.registrations(id,activity_id,person_id,registration_code,status,confirmed_at,certificate_mode_snapshot,job_title_snapshot) values
 ('45000000-0000-4000-8000-000000000030','45000000-0000-4000-8000-000000000020','45000000-0000-4000-8000-000000000010','CCI-REG-45','confirmed',now(),'included','Participante');
insert into public.certificates(
 id,person_id,template_id,registration_id,certificate_type,certificate_code,participant_name_snapshot,
 title_snapshot,academic_hours_snapshot,file_path,access_token,issued_at,condition_snapshot,date_text_snapshot
) values (
 '45000000-0000-4000-8000-000000000040','45000000-0000-4000-8000-000000000010',
 'c5000000-0000-4000-8000-000000000001','45000000-0000-4000-8000-000000000030','activity','CCI-CERT-45',
 'Nombre histórico','Título histórico',100,'issued/45000000-0000-4000-8000-000000000040/old.pdf',
 '45000000-0000-4000-8000-000000000050','2026-09-01T12:00:00Z','Participó','01/09/2026'
);

create temp table original45 as select * from public.certificates where id='45000000-0000-4000-8000-000000000040';
create function pg_temp.correct45(
  p_title text default 'Título actualizado', p_hours numeric default 125,
  p_old text default 'issued/45000000-0000-4000-8000-000000000040/old.pdf',
  p_new text default 'issued/45000000-0000-4000-8000-000000000040/new.pdf',
  p_activity uuid default '45000000-0000-4000-8000-000000000020'
) returns jsonb language sql as $$
  select public.replace_activity_certificate_details('45000000-0000-4000-8000-000000000040',
    p_activity,p_hours,p_title,p_old,p_new);
$$;
grant select on original45 to authenticated;

set local role authenticated;
select set_config('request.jwt.claim.sub','45000000-0000-4000-8000-000000000002',true);
select throws_ok($$select pg_temp.correct45()$$,'42501','UNAUTHORIZED','student rejected');
select set_config('request.jwt.claim.sub','45000000-0000-4000-8000-000000000001',true);
select throws_ok($$select pg_temp.correct45(p_title=>'Título de otra pestaña')$$,'40001','ACTIVITY_DETAILS_CHANGED','stale title rejected');
select throws_ok($$select pg_temp.correct45(p_hours=>100)$$,'40001','ACTIVITY_DETAILS_CHANGED','stale hours rejected');
select throws_ok($$select pg_temp.correct45(p_title=>' ')$$,'22023','VALIDATION_ERROR','empty title rejected');
select throws_ok($$select pg_temp.correct45(p_title=>repeat('A',301))$$,'22023','VALIDATION_ERROR','oversized title rejected');
select throws_ok($$select pg_temp.correct45(p_hours=>0)$$,'22023','VALIDATION_ERROR','zero hours rejected');
select throws_ok($$select pg_temp.correct45(p_new=>'issued/another-id/new.pdf')$$,'22023','VALIDATION_ERROR','foreign storage path rejected');
select throws_ok($$select pg_temp.correct45(p_old=>'issued/45000000-0000-4000-8000-000000000040/stale.pdf')$$,'40001','CERTIFICATE_CHANGED','stale document rejected');
select throws_ok($$select pg_temp.correct45(p_activity=>'45000000-0000-4000-8000-000000000021')$$,'P0001','CERTIFICATE_ACTIVITY_MISMATCH','foreign activity rejected');

select set_config('request.jwt.claim.sub','45000000-0000-4000-8000-000000000003',true);
select lives_ok($$select pg_temp.correct45()$$,'operator corrects title and hours together');
select is((select title_snapshot from public.certificates where certificate_code='CCI-CERT-45'),'Título actualizado','title corrected');
select is((select academic_hours_snapshot from public.certificates where certificate_code='CCI-CERT-45'),125::numeric,'hours corrected');
select is(
 (select to_jsonb(c)-'academic_hours_snapshot'-'title_snapshot'-'file_path'-'updated_at' from public.certificates c where certificate_code='CCI-CERT-45'),
 (select to_jsonb(c)-'academic_hours_snapshot'-'title_snapshot'-'file_path'-'updated_at' from original45 c),
 'identity, name, dates, template snapshot, code and token preserved'
);
select throws_ok($$select pg_temp.correct45()$$,'40001','CERTIFICATE_CHANGED','old retry cannot overwrite successful correction');
select is((select count(*) from public.notification_outbox where related_entity_id='45000000-0000-4000-8000-000000000040'),0::bigint,'correction creates no email');

reset role;
select is((select count(*) from public.audit_logs where action='certificate.details_corrected'
 and entity_id='45000000-0000-4000-8000-000000000040'
 and actor_user_id='45000000-0000-4000-8000-000000000003'
 and old_data->>'title_snapshot'='Título histórico' and new_data->>'title_snapshot'='Título actualizado'),
 1::bigint,'actor and previous and current values audited');
update public.activities set title='Nuevo título únicamente' where id='45000000-0000-4000-8000-000000000020';
set local role authenticated;
select set_config('request.jwt.claim.sub','45000000-0000-4000-8000-000000000001',true);
select lives_ok($$select pg_temp.correct45(p_title=>'Nuevo título únicamente',
 p_old=>'issued/45000000-0000-4000-8000-000000000040/new.pdf',
 p_new=>'issued/45000000-0000-4000-8000-000000000040/title-only.pdf')$$,'title-only correction succeeds when hours already match');
select is((select title_snapshot from public.certificates where certificate_code='CCI-CERT-45'),'Nuevo título únicamente','title-only correction stored');
select is((select academic_hours_snapshot from public.certificates where certificate_code='CCI-CERT-45'),125::numeric,'title-only correction preserves correct hours');

reset role;
update public.certificates set status='revoked',revoked_at=now(),revocation_reason='Prueba' where certificate_code='CCI-CERT-45';
set local role authenticated;
select set_config('request.jwt.claim.sub','45000000-0000-4000-8000-000000000001',true);
select throws_ok($$select pg_temp.correct45(p_title=>'Nuevo título únicamente',
 p_old=>'issued/45000000-0000-4000-8000-000000000040/title-only.pdf')$$,
 'P0001','CERTIFICATE_NOT_ISSUED','revoked certificates rejected');
reset role;
update public.activities set status='archived' where id='45000000-0000-4000-8000-000000000020';
set local role authenticated;
select set_config('request.jwt.claim.sub','45000000-0000-4000-8000-000000000001',true);
select throws_ok($$select pg_temp.correct45(p_title=>'Nuevo título únicamente')$$,
 'P0001','ACTIVITY_NOT_AVAILABLE','archived activity rejected');
reset role;
select * from finish(true);
rollback;
