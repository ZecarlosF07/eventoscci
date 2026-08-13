begin;

select no_plan();

select has_type('public', 'course_status', 'course_status enum exists');
select has_type('public', 'course_enrollment_status', 'course enrollment status enum exists');
select has_type('public', 'material_type', 'material type enum exists');
select has_table('public', 'courses', 'courses table exists');
select has_table('public', 'course_instructors', 'course instructors table exists');
select has_table('public', 'course_modules', 'course modules table exists');
select has_table('public', 'lessons', 'lessons table exists');
select has_table('public', 'course_materials', 'course materials table exists');
select has_table('public', 'course_enrollments', 'course enrollments table exists');
select ok(to_regprocedure('public.save_course(jsonb,jsonb)') is not null, 'course save RPC exists');
select ok(to_regprocedure('public.enroll_free_course(uuid)') is not null, 'free enrollment RPC exists');
select ok(to_regprocedure('public.grant_course_access(uuid,uuid,public.registration_type,numeric)') is not null, 'administrative enrollment RPC exists');
select ok(to_regprocedure('public.revoke_course_access(uuid,text)') is not null, 'revocation RPC exists');
select ok(exists (select 1 from pg_indexes where indexname = 'uq_courses_slug_active'), 'active course slug is unique');
select ok(exists (select 1 from pg_indexes where indexname = 'uq_course_enrollment_active'), 'active course enrollment is unique');
select ok(exists (select 1 from pg_indexes where indexname = 'uq_course_primary_instructor_active'), 'one active primary instructor is enforced');
select ok(exists (select 1 from pg_trigger where tgname = 'set_courses_updated_at' and not tgisinternal), 'courses updated_at trigger exists');
select ok(exists (select 1 from pg_trigger where tgname = 'set_lessons_updated_at' and not tgisinternal), 'lessons updated_at trigger exists');
select ok(exists (select 1 from storage.buckets where id = 'course-banners' and public), 'public course banner bucket exists');
select ok(exists (select 1 from storage.buckets where id = 'course-materials' and not public), 'private course material bucket exists');
select ok(exists (select 1 from storage.buckets where id = 'course-videos' and not public), 'private course video bucket exists');

insert into public.people (id, document_type, document_number, first_names, last_names, email, phone, job_title)
values
  ('37000000-0000-4000-8000-000000000001', 'dni', '17000001', 'Admin', 'Cursos', 'admin7@example.test', '917000001', 'Administradora'),
  ('37000000-0000-4000-8000-000000000002', 'dni', '17000002', 'Alumno', 'Gratis', 'student7@example.test', '917000002', 'Analista'),
  ('37000000-0000-4000-8000-000000000003', 'dni', '17000003', 'Alumno', 'Pago', 'student7paid@example.test', '917000003', 'Gerente');
insert into auth.users (id, email) values
  ('87000000-0000-4000-8000-000000000001', 'admin7@example.test'),
  ('87000000-0000-4000-8000-000000000002', 'student7@example.test'),
  ('87000000-0000-4000-8000-000000000003', 'student7paid@example.test');
insert into public.user_accounts (user_id, person_id, role) values
  ('87000000-0000-4000-8000-000000000001', '37000000-0000-4000-8000-000000000001', 'administrator'),
  ('87000000-0000-4000-8000-000000000002', '37000000-0000-4000-8000-000000000002', 'student'),
  ('87000000-0000-4000-8000-000000000003', '37000000-0000-4000-8000-000000000003', 'student');
insert into public.speakers (id, first_names, last_names, professional_title)
values ('47000000-0000-4000-8000-000000000001', 'Docente', 'Principal', 'Especialista');

set local role authenticated;
select set_config('request.jwt.claim.sub', '87000000-0000-4000-8000-000000000001', true);
select is(
  public.save_course(
    '{"id":"57000000-0000-4000-8000-000000000001","title":"Curso gratuito","slug":"curso-gratuito","short_description":"Curso de prueba","description":"Descripción completa del curso gratuito","objectives":"Aprender","contents_overview":"Dos módulos","duration_text":"4 horas","academic_hours":"4","banner_path":"","is_free":true,"general_price":"0","member_price":"0","status":"published"}'::jsonb,
    '[{"speaker_id":"47000000-0000-4000-8000-000000000001","is_primary":true,"role_label":"Instructor principal","sort_order":0}]'::jsonb
  ),
  '57000000-0000-4000-8000-000000000001'::uuid,
  'administrator creates a complete published course'
);

select is((select status from public.courses where id = '57000000-0000-4000-8000-000000000001'), 'published'::public.course_status, 'course is published');
select ok((select published_at is not null from public.courses where id = '57000000-0000-4000-8000-000000000001'), 'publication timestamp is recorded');
select is((select count(*) from public.course_instructors where course_id = '57000000-0000-4000-8000-000000000001' and deleted_at is null), 1::bigint, 'instructor is assigned');
select ok((select is_primary from public.course_instructors where course_id = '57000000-0000-4000-8000-000000000001' and deleted_at is null), 'primary instructor is preserved');

insert into public.courses (id, title, slug, description, is_free, general_price, member_price, status, published_at)
values
  ('57000000-0000-4000-8000-000000000002', 'Curso con costo', 'curso-con-costo', 'Descripción del curso con costo', false, 100, 75, 'published', now()),
  ('57000000-0000-4000-8000-000000000003', 'Curso borrador', 'curso-borrador', 'Descripción del borrador', true, 0, 0, 'draft', null);

insert into public.course_modules (id, course_id, title, description, sort_order, is_published) values
  ('67000000-0000-4000-8000-000000000001', '57000000-0000-4000-8000-000000000001', 'Módulo visible', 'Contenido visible', 0, true),
  ('67000000-0000-4000-8000-000000000002', '57000000-0000-4000-8000-000000000001', 'Módulo oculto', 'Contenido en preparación', 1, false);
insert into public.lessons (id, module_id, title, sort_order, video_provider, video_asset_id, duration_seconds, is_required, is_published) values
  ('77000000-0000-4000-8000-000000000001', '67000000-0000-4000-8000-000000000001', 'Clase visible', 0, 'youtube', 'dQw4w9WgXcQ', 180, true, true),
  ('77000000-0000-4000-8000-000000000002', '67000000-0000-4000-8000-000000000001', 'Clase oculta', 1, 'youtube', 'dQw4w9WgXcQ', 200, true, false);
insert into public.course_materials (id, course_id, title, material_type, external_url, sort_order)
values ('97000000-0000-4000-8000-000000000001', '57000000-0000-4000-8000-000000000001', 'Recurso externo', 'external_link', 'https://example.com/recurso', 0);

select throws_ok(
  $$insert into public.courses (title, slug, description, is_free, general_price, member_price) values ('Inválido', 'curso-invalido-precio', 'Descripción', true, 10, 0)$$,
  '23514', null, 'free course prices must remain zero'
);
select throws_ok(
  $$insert into public.lessons (module_id, title, duration_seconds) values ('67000000-0000-4000-8000-000000000001', 'Duración inválida', 0)$$,
  '23514', null, 'lesson duration must be positive'
);
select throws_ok(
  $$insert into public.course_materials (course_id, title, material_type, external_url, storage_path) values ('57000000-0000-4000-8000-000000000001', 'Inválido', 'file', 'https://example.com', 'file.pdf')$$,
  '23514', null, 'file material cannot also use an external URL'
);
select throws_ok(
  $$insert into public.courses (title, slug, description) values ('Duplicado', 'curso-gratuito', 'Descripción duplicada')$$,
  '23505', null, 'active course slugs cannot be duplicated'
);

reset role;
set local role anon;
select is((select count(*) from public.courses where id = '57000000-0000-4000-8000-000000000001'), 1::bigint, 'anonymous visitors see published courses');
select is((select count(*) from public.courses where id = '57000000-0000-4000-8000-000000000003'), 0::bigint, 'anonymous visitors do not see drafts');
select is((select count(*) from public.course_modules), 1::bigint, 'anonymous visitors only see published modules');
select is((select count(*) from public.course_instructors), 1::bigint, 'anonymous visitors see published course instructors');
select is(has_table_privilege('anon', 'public.lessons', 'SELECT'), false, 'anonymous visitors cannot read lesson video data');
select is(has_table_privilege('anon', 'public.course_materials', 'SELECT'), false, 'anonymous visitors cannot read private materials');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '87000000-0000-4000-8000-000000000002', true);
select is(public.current_person_id(), '37000000-0000-4000-8000-000000000002'::uuid, 'authenticated student resolves to institutional person');
select is(public.enroll_free_course('57000000-0000-4000-8000-000000000001'), public.enroll_free_course('57000000-0000-4000-8000-000000000001'), 'free enrollment is idempotent');
select ok(public.has_active_course_enrollment('57000000-0000-4000-8000-000000000001'), 'free course grants immediate access');
select is((select count(*) from public.course_enrollments), 1::bigint, 'student sees only their own enrollment');
select is((select price_snapshot from public.course_enrollments where course_id = '57000000-0000-4000-8000-000000000001'), 0::numeric, 'free enrollment stores zero price');
select is((select count(*) from public.lessons), 1::bigint, 'student sees only published lessons in an enrolled course');
select is((select count(*) from public.course_materials), 1::bigint, 'student sees general materials for enrolled course');
select throws_ok(
  $$select public.enroll_free_course('57000000-0000-4000-8000-000000000002')$$,
  'P0001', 'COURSE_NOT_FREE', 'paid courses cannot be self-enrolled'
);
select throws_ok(
  $$insert into public.courses (title, slug, description) values ('No permitido', 'no-permitido', 'Descripción')$$,
  '42501', null, 'student cannot create courses'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '87000000-0000-4000-8000-000000000001', true);
select lives_ok(
  $$select public.grant_course_access(
    '57000000-0000-4000-8000-000000000002',
    '37000000-0000-4000-8000-000000000003',
    'member', null
  )$$,
  'administrator grants paid course access'
);
select is((select price_snapshot from public.course_enrollments where course_id = '57000000-0000-4000-8000-000000000002'), 75::numeric, 'member price is snapshotted');
select is((select registration_type from public.course_enrollments where course_id = '57000000-0000-4000-8000-000000000002'), 'member'::public.registration_type, 'registration type is stored');
select lives_ok(
  $$select public.revoke_course_access((select id from public.course_enrollments where course_id = '57000000-0000-4000-8000-000000000002'), 'Validación externa anulada')$$,
  'administrator revokes access without deleting history'
);
select is((select status from public.course_enrollments where course_id = '57000000-0000-4000-8000-000000000002'), 'revoked'::public.course_enrollment_status, 'revoked status is stored');
select ok((select revoked_at is not null from public.course_enrollments where course_id = '57000000-0000-4000-8000-000000000002'), 'revocation timestamp is stored');
select is((select deleted_at from public.course_enrollments where course_id = '57000000-0000-4000-8000-000000000002'), null::timestamptz, 'revocation does not soft-delete enrollment');
select is((select count(*) from public.audit_logs where action in ('course_access_granted', 'course_access_revoked')), 2::bigint, 'grant and revocation are audited');
select throws_ok(
  $$select public.revoke_course_access((select id from public.course_enrollments where course_id = '57000000-0000-4000-8000-000000000002'), '')$$,
  '22023', 'REVOCATION_REASON_REQUIRED', 'revocation requires a reason'
);

select * from finish(true);
rollback;
