begin;

select plan(18);

select ok(
  to_regprocedure('public.is_activity_certificate_visible(uuid)') is not null,
  'certificate visibility helper exists'
);

select ok(
  pg_get_viewdef('public.activity_participation_summary'::regclass) like '%status <> ''archived''%',
  'participation summary excludes archived activities'
);

select ok(
  pg_get_functiondef('public.get_certificate_activity_summaries(text,public.activity_type,integer,integer)'::regprocedure)
    like '%status <> ''archived''%',
  'certificate activity summary excludes archived activities'
);

select ok(
  exists (
    select 1 from pg_trigger
    where tgname = 'reject_archived_registration_operation' and not tgisinternal
  ),
  'registration writes are guarded'
);

select ok(
  exists (
    select 1 from pg_trigger
    where tgname = 'reject_archived_attendance_operation' and not tgisinternal
  ),
  'attendance writes are guarded'
);

select ok(
  exists (
    select 1 from pg_trigger
    where tgname = 'reject_archived_certificate_operation' and not tgisinternal
  ),
  'activity certificate writes are guarded'
);

insert into auth.users (id, email) values
  ('8a000000-0000-4000-8000-000000000001', 'archive.student@example.test'),
  ('8a000000-0000-4000-8000-000000000002', 'archive.admin@example.test');

insert into public.people (
  id, document_type, document_number, first_names, last_names, email, phone, job_title
) values
  ('3a000000-0000-4000-8000-000000000001', 'dni', '30000001', 'Estudiante', 'Archivado', 'archive.student@example.test', '930000001', 'Estudiante'),
  ('3a000000-0000-4000-8000-000000000002', 'dni', '30000002', 'Administrador', 'Archivado', 'archive.admin@example.test', '930000002', 'Administrador');

insert into public.user_accounts (user_id, person_id, role) values
  ('8a000000-0000-4000-8000-000000000001', '3a000000-0000-4000-8000-000000000001', 'student'),
  ('8a000000-0000-4000-8000-000000000002', '3a000000-0000-4000-8000-000000000002', 'administrator');

insert into public.activity_contacts (
  id, label, contact_name, whatsapp_phone
) values (
  '8a000000-0000-4000-8000-000000000003',
  'Contacto temporal archivado',
  'Contacto temporal',
  '930000003'
);

insert into public.activities (
  id, contact_id, type, title, slug, description, modality, is_free, status, published_at
) values (
  '7a000000-0000-4000-8000-000000000001',
  '8a000000-0000-4000-8000-000000000003',
  'event',
  'Actividad temporal archivada',
  'actividad-temporal-archivada',
  'Actividad transaccional para comprobar el archivado integral.',
  'virtual',
  true,
  'published',
  now()
);

insert into public.registrations (
  id, activity_id, person_id, registration_code, status, confirmed_at
) values (
  '7a000000-0000-4000-8000-000000000002',
  '7a000000-0000-4000-8000-000000000001',
  '3a000000-0000-4000-8000-000000000001',
  'CCI-ARCHIVE-TEST',
  'confirmed',
  now()
);

insert into public.attendance (id, registration_id, status, marked_at)
values (
  '7a000000-0000-4000-8000-000000000003',
  '7a000000-0000-4000-8000-000000000002',
  'attended',
  now()
);

insert into public.certificate_templates (id, name, scope)
values ('7a000000-0000-4000-8000-000000000004', 'Plantilla temporal archivada', 'activity');

insert into public.certificates (
  id, person_id, template_id, registration_id, certificate_type, certificate_code,
  participant_name_snapshot, title_snapshot, file_path, access_token
) values (
  '7a000000-0000-4000-8000-000000000005',
  '3a000000-0000-4000-8000-000000000001',
  '7a000000-0000-4000-8000-000000000004',
  '7a000000-0000-4000-8000-000000000002',
  'activity',
  'CCI-ARCHIVE-CERT',
  'Estudiante Archivado',
  'Actividad temporal archivada',
  'issued/7a000000-0000-4000-8000-000000000005/certificate.pdf',
  '7a000000-0000-4000-8000-000000000006'
);

update public.activities
set status = 'archived'
where id = '7a000000-0000-4000-8000-000000000001';

select is(
  (select count(*) from public.activity_participation_summary where activity_id = '7a000000-0000-4000-8000-000000000001'),
  0::bigint,
  'archived activity is absent from participation'
);

select is(
  public.get_public_certificate('7a000000-0000-4000-8000-000000000006'::text),
  null::jsonb,
  'archived activity certificate is hidden by token'
);

select is(
  public.get_public_certificate_file('7a000000-0000-4000-8000-000000000006'::text),
  null::text,
  'archived activity certificate file is hidden'
);

select is(
  public.get_public_registration_result('CCI-ARCHIVE-TEST'),
  null::jsonb,
  'archived activity registration result is hidden'
);

select throws_ok(
  $$update public.registrations set company_snapshot = 'Bloqueado' where id = '7a000000-0000-4000-8000-000000000002'$$,
  'P0001',
  'ACTIVITY_ARCHIVED',
  'archived activity registration cannot change'
);

select throws_ok(
  $$update public.attendance set notes = 'Bloqueado' where id = '7a000000-0000-4000-8000-000000000003'$$,
  'P0001',
  'ACTIVITY_ARCHIVED',
  'archived activity attendance cannot change'
);

select throws_ok(
  $$update public.certificates set title_snapshot = 'Bloqueado' where id = '7a000000-0000-4000-8000-000000000005'$$,
  'P0001',
  'ACTIVITY_ARCHIVED',
  'archived activity certificate cannot change'
);

set local role anon;
select is(
  (select count(*) from public.activities where id = '7a000000-0000-4000-8000-000000000001'),
  0::bigint,
  'anonymous users cannot read archived activities'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '8a000000-0000-4000-8000-000000000001', true);
select is(
  jsonb_array_length(public.get_my_certificates()),
  0,
  'student cannot see certificates from archived activities'
);
reset role;

select ok(
  pg_get_expr(polqual, polrelid) like '%is_activity_certificate_visible%',
  'certificate storage policy checks activity visibility'
)
from pg_policy
where polname = 'certificates_storage_owner_read';

select throws_ok(
  $$update public.activities set status = 'published' where id = '7a000000-0000-4000-8000-000000000001'$$,
  'P0001',
  'ARCHIVED_RESTORE_REQUIRES_DRAFT',
  'archived activity cannot be republished without restoring it as draft'
);

update public.activities
set status = 'draft'
where id = '7a000000-0000-4000-8000-000000000001';

select lives_ok(
  $$update public.registrations set company_snapshot = 'Restaurado' where id = '7a000000-0000-4000-8000-000000000002'$$,
  'restoring as draft unlocks preserved operations'
);

select * from finish(true);

rollback;
