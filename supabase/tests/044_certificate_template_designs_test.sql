begin;
select no_plan();

insert into auth.users(id,email) values
('a2000000-0000-4000-8000-000000000001','h20-admin@example.test'),
('a2000000-0000-4000-8000-000000000002','h20-operator@example.test'),
('a2000000-0000-4000-8000-000000000003','h20-student@example.test');
insert into public.people(id,document_type,document_number,first_names,last_names,email,phone,job_title) values
('b2000000-0000-4000-8000-000000000001','dni','20000001','Admin','Prueba','h20-admin@example.test','920000001','Admin'),
('b2000000-0000-4000-8000-000000000002','dni','20000002','Operador','Prueba','h20-operator@example.test','920000002','Operador'),
('b2000000-0000-4000-8000-000000000003','dni','20000003','Estudiante','Prueba','h20-student@example.test','920000003','Estudiante');
insert into public.user_accounts(user_id,person_id,role) values
('a2000000-0000-4000-8000-000000000001','b2000000-0000-4000-8000-000000000001','administrator'),
('a2000000-0000-4000-8000-000000000002','b2000000-0000-4000-8000-000000000002','operator'),
('a2000000-0000-4000-8000-000000000003','b2000000-0000-4000-8000-000000000003','student');

create temp table h20_templates(kind text, id uuid, model jsonb, signers jsonb);
insert into h20_templates
select kind,id,jsonb_build_object('id',id,'audience',kind,'scope',case when kind='student' then 'course' else 'activity' end,
  'name','Modelo H20 '||kind,'is_default',true,'template_config',jsonb_build_object('heading','Encabezado H20','recognition','Reconocemos a quien {{condicion}} en {{titulo}}')),
  jsonb_build_array(jsonb_build_object('signer_name','Firmante Uno','signer_title','Presidencia','signature_path','templates/'||id||'/signature/a.png'))
from (values
  ('participant','c2000000-0000-4000-8000-000000000001'::uuid),
  ('speaker','c2000000-0000-4000-8000-000000000002'::uuid),
  ('student','c2000000-0000-4000-8000-000000000003'::uuid)
) seed(kind,id);
insert into storage.objects(bucket_id,name)
select 'certificates',signers->0->>'signature_path' from h20_templates;
insert into storage.objects(bucket_id,name) values
  ('certificates','templates/c2000000-0000-4000-8000-000000000002/signature/b.png');
grant select on h20_templates to authenticated;
insert into public.certificate_templates(id,name,scope)
values ('c2000000-0000-4000-8000-000000000004','Modelo anterior H20','activity');
insert into public.certificate_template_signers(id,template_id,signer_name)
values ('c2100000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000004','Firmante de prueba');

insert into public.activities(id,type,title,slug,description,modality,is_free,status,certificate_mode,academic_hours)
values ('d2000000-0000-4000-8000-000000000001','training','Prueba de diseños','h20-disenos','Actividad de prueba','virtual',true,'draft','included',8);
insert into public.speakers(id,first_names,last_names) values
  ('e2000000-0000-4000-8000-000000000001','Ana','Prueba'),
  ('e2000000-0000-4000-8000-000000000002','Luis','Prueba');
insert into public.speaker_private_details(speaker_id,email) values
  ('e2000000-0000-4000-8000-000000000001','ana-h20@example.test'),
  ('e2000000-0000-4000-8000-000000000002','luis-h20@example.test');
insert into public.activity_speakers(activity_id,speaker_id,role_label)
select 'd2000000-0000-4000-8000-000000000001', id, 'Panelista' from public.speakers
where id in ('e2000000-0000-4000-8000-000000000001','e2000000-0000-4000-8000-000000000002');

select is(has_function_privilege('anon','public.save_certificate_template(jsonb,jsonb)','EXECUTE'),false,'anon cannot save templates');
select is(has_function_privilege('authenticated','public.snapshot_certificate_template(uuid)','EXECUTE'),false,'snapshot helper is private');
select is(has_table_privilege('authenticated','public.certificate_template_signers','INSERT'),false,'direct signer inserts are denied');
select is((select legacy_snapshot->>'snapshot_origin' from public.certificate_templates where id='c5000000-0000-4000-8000-000000000001'),'migration_reference','legacy design reference captured');

set local role authenticated;
select set_config('request.jwt.claim.sub','a2000000-0000-4000-8000-000000000003',true);
select throws_ok($$select public.save_certificate_template(model,signers) from h20_templates where kind='speaker'$$,'42501','UNAUTHORIZED','student cannot save');
select set_config('request.jwt.claim.sub','a2000000-0000-4000-8000-000000000002',true);
select throws_ok($$select public.save_certificate_template(model,signers) from h20_templates where kind='speaker'$$,'42501','UNAUTHORIZED','operator cannot save');
select throws_ok($$select public.soft_delete_certificate_template('c5000000-0000-4000-8000-000000000001')$$,'42501','UNAUTHORIZED','operator cannot retire');
select throws_ok($$select public.retire_certificate_template('c5000000-0000-4000-8000-000000000001')$$,'42501','UNAUTHORIZED','operator cannot retire through the new editor');
select throws_like($$insert into storage.objects(bucket_id,name) values('certificates','staging/h20.png')$$,'%row-level security%','operator cannot upload template images');
select set_config('request.jwt.claim.sub','a2000000-0000-4000-8000-000000000001',true);
select throws_ok($$select public.save_certificate_template(model,signers||signers||signers||signers||signers) from h20_templates where kind='speaker'$$,'22023','VALIDATION_ERROR','fifth signer rejected');
select throws_ok($$select public.save_certificate_template(model,'[{"signer_name":"Firma faltante"}]') from h20_templates where kind='speaker'$$,'22023','SIGNATURE_REQUIRED','new signer requires a signature');
select throws_ok($$select public.save_certificate_template(jsonb_set(model,'{template_config,recognition}','"Texto sin variable"'),signers) from h20_templates where kind='speaker'$$,'22023','VALIDATION_ERROR','recognition requires condition variable');
select lives_ok($$select public.save_certificate_template(model,signers||signers||signers||signers) from h20_templates where kind='speaker'$$,'administrator creates a model with four signers');
select lives_ok($$select public.save_certificate_template(model,signers) from h20_templates where kind<>'speaker'$$,'administrator creates participant and course models');
select is((select count(*) from public.certificate_templates where id in (select id from h20_templates) and is_default),3::bigint,'specific defaults coexist');
select lives_ok($$select public.retire_certificate_template(id) from h20_templates where kind='student'$$,
  'course model can be retired when another one is available');
reset role;
-- Isolate a sole active course model for all retirement and deactivation paths.
update public.certificate_templates set is_active = false, is_default = false
where scope='course' and id <> 'c5000000-0000-4000-8000-000000000002' and is_active and deleted_at is null;
set local role authenticated;
select set_config('request.jwt.claim.sub','a2000000-0000-4000-8000-000000000001',true);
select throws_ok($$select public.retire_certificate_template('c5000000-0000-4000-8000-000000000002')$$,
  'P0001','LAST_ACTIVE_COURSE_TEMPLATE','new editor keeps the last active course model');
select throws_ok($$select public.soft_delete_certificate_template('c5000000-0000-4000-8000-000000000002')$$,
  'P0001','LAST_ACTIVE_COURSE_TEMPLATE','old editor keeps the last active course model');
select throws_ok($$select public.save_certificate_template(
  '{"id":"c5000000-0000-4000-8000-000000000002","scope":"course","name":"Curso H20","is_active":false}',
  '[{"sort_order":0,"signer_name":"Firmante original"}]')$$,
  'P0001','LAST_ACTIVE_COURSE_TEMPLATE','save cannot deactivate the last active course model');
select ok(exists(select 1 from public.certificate_templates where scope='activity' and audience is null and is_default and is_active and deleted_at is null),'shared default remains available');
select throws_ok($$select public.save_certificate_template(model || '{"audience":"participant"}',signers) from h20_templates where kind='speaker'$$,'22023','VALIDATION_ERROR','existing audience is immutable');
select lives_ok($$select public.save_certificate_template(
  '{"id":"c2000000-0000-4000-8000-000000000004","name":"Modelo anterior H20","scope":"activity"}',
  '[{"sort_order":0,"signer_name":"Firmante original"}]')$$,'old editor can retain a grandfathered signer without an image');
select is((select template_config->>'layout_version' from public.certificate_templates where id='c2000000-0000-4000-8000-000000000004'),null::text,'old editor retains its layout');
select lives_ok($$select public.save_certificate_template(
  jsonb_build_object('id',id,'name',name,'scope',scope,'expected_updated_at',updated_at),
  '[{"id":"c2100000-0000-4000-8000-000000000001","signer_name":"Firmante original"}]')
  from public.certificate_templates where id='c2000000-0000-4000-8000-000000000004'$$,'new editor upgrades the layout when saving');
select is((select template_config->>'layout_version' from public.certificate_templates where id='c2000000-0000-4000-8000-000000000004'),'2','new editor saves layout version 2');
select lives_ok($$insert into storage.objects(bucket_id,name) values('certificates','staging/h20-admin.png')$$,'administrator can stage images');
with changed as (update storage.objects set metadata='{}' where bucket_id='certificates' and name like 'templates/c2000000-%' returning 1)
select is((select count(*) from changed),0::bigint,'administrator cannot overwrite immutable images');

select public.set_speaker_document('e2000000-0000-4000-8000-000000000001','02000001');
select public.set_speaker_document('e2000000-0000-4000-8000-000000000002','02000002');
select throws_ok($$select public.prepare_speaker_certificates('d2000000-0000-4000-8000-000000000001',
  'c2000000-0000-4000-8000-000000000001','[{"speaker_id":"e2000000-0000-4000-8000-000000000001"}]')$$,'P0001','TEMPLATE_NOT_AVAILABLE','participant model cannot issue a speaker certificate');
select lives_ok($$select public.prepare_speaker_certificates('d2000000-0000-4000-8000-000000000001',
  'c2000000-0000-4000-8000-000000000002','[{"speaker_id":"e2000000-0000-4000-8000-000000000001"}]')$$,'speaker model prepares a speaker certificate');
select is((select jsonb_array_length(template_snapshot->'signers') from public.certificates where speaker_id='e2000000-0000-4000-8000-000000000001'),4,'all four signers frozen');
select lives_ok($$select public.save_certificate_template(model || '{"template_config":{"heading":"Nuevo texto"}}',
  jsonb_set(signers,'{0,signature_path}','"templates/c2000000-0000-4000-8000-000000000002/signature/b.png"'))
  from h20_templates where kind='speaker'$$,'change template for future issues');
select lives_ok($$select public.prepare_speaker_certificates('d2000000-0000-4000-8000-000000000001',
  'c2000000-0000-4000-8000-000000000002','[{"speaker_id":"e2000000-0000-4000-8000-000000000002"}]')$$,'future certificate captures changed model');
select is((select template_snapshot#>>'{template_config,heading}' from public.certificates where speaker_id='e2000000-0000-4000-8000-000000000001'),'Encabezado H20','prior text stays frozen');
select is((select template_snapshot#>>'{signers,0,signature_path}' from public.certificates where speaker_id='e2000000-0000-4000-8000-000000000001'),
  'templates/c2000000-0000-4000-8000-000000000002/signature/a.png','prior signature stays frozen');
select is((select template_snapshot#>>'{signers,0,signature_path}' from public.certificates where speaker_id='e2000000-0000-4000-8000-000000000002'),
  'templates/c2000000-0000-4000-8000-000000000002/signature/b.png','new certificate uses replacement signature');
select throws_ok($$select public.soft_delete_certificate_template('c2000000-0000-4000-8000-000000000002')$$,'P0001','TEMPLATE_IN_USE','old editor protects templates needed by its generator');
select lives_ok($$select public.retire_certificate_template('c2000000-0000-4000-8000-000000000002')$$,'administrator can retire after issuance');
select is((select jsonb_array_length(template_snapshot->'signers') from public.certificates where speaker_id='e2000000-0000-4000-8000-000000000001'),4,'retirement preserves frozen design');

reset role;
select ok((select qual like '%staging/%' and qual not like '%templates/%' from pg_policies
  where schemaname='storage' and tablename='objects' and policyname='certificates_storage_internal_delete'),
  'certificate delete policy allows staging and excludes template images');
select throws_ok($$update public.certificates set template_snapshot='{}' where speaker_id='e2000000-0000-4000-8000-000000000001'$$,
  '22023','CERTIFICATE_DESIGN_IMMUTABLE','certificate design cannot be rewritten');
select throws_ok($$insert into public.certificate_issue_batches(activity_id,template_id,condition)
  values('d2000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000002','Participó')$$,'P0001','TEMPLATE_NOT_AVAILABLE','batch rejects speaker model');
insert into public.certificate_issue_batches(id,activity_id,template_id,condition,created_by) values
  ('f2000000-0000-4000-8000-000000000001','d2000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001','Participó','a2000000-0000-4000-8000-000000000001');
insert into public.registrations(id,activity_id,person_id,registration_code,registration_type,status,price_snapshot,confirmed_at,job_title_snapshot)
values ('12000000-0000-4000-8000-000000000001','d2000000-0000-4000-8000-000000000001','b2000000-0000-4000-8000-000000000003','H20-TEST','general','confirmed',0,now(),'Prueba');
insert into public.certificate_issue_batch_items(batch_id,registration_id) values
('f2000000-0000-4000-8000-000000000001','12000000-0000-4000-8000-000000000001');
set local role authenticated;
select set_config('request.jwt.claim.sub','a2000000-0000-4000-8000-000000000001',true);
select throws_ok($$select public.save_certificate_template(model,signers) from h20_templates where kind='participant'$$,
  'P0001','TEMPLATE_BATCH_ACTIVE','model cannot be edited during a batch');
select throws_ok($$select public.retire_certificate_template('c2000000-0000-4000-8000-000000000001')$$,
  'P0001','TEMPLATE_BATCH_ACTIVE','model cannot be retired during a batch');
reset role;
select * from finish(true);
rollback;
