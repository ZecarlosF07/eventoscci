begin;

select no_plan();

select is(
  (
    select count(*)
    from pg_class relation
    join pg_namespace namespace on namespace.oid = relation.relnamespace
    where namespace.nspname = 'public'
      and relation.relkind = 'r'
      and not relation.relrowsecurity
  ),
  0::bigint,
  'all public application tables have RLS enabled'
);

select ok(to_regprocedure('public.current_user_role()') is not null, 'active role helper exists');
select ok(to_regprocedure('public.is_internal_user()') is not null, 'internal role helper exists');
select ok(to_regprocedure('public.is_administrator()') is not null, 'administrator helper exists');
select is(
  (
    select count(*)
    from pg_proc function_row
    join pg_namespace namespace on namespace.oid = function_row.pronamespace
    where namespace.nspname = 'public'
      and function_row.prosecdef
      and not coalesce(function_row.proconfig @> array['search_path=""'], false)
  ),
  0::bigint,
  'every SECURITY DEFINER function fixes an empty search_path'
);

select ok(has_function_privilege('anon', 'public.register_activity(uuid,jsonb)', 'EXECUTE'), 'anonymous registration RPC remains available');
select ok(has_function_privilege('anon', 'public.get_activity_registration_availability(uuid)', 'EXECUTE'), 'anonymous availability RPC remains available');
select ok(has_function_privilege('anon', 'public.get_public_certificate(text)', 'EXECUTE'), 'public certificate lookup remains available');
select is(has_function_privilege('anon', 'public.grant_course_access(uuid,uuid,public.registration_type,numeric)', 'EXECUTE'), false, 'anonymous cannot execute course grants');
select is(has_function_privilege('anon', 'public.update_lesson_progress(uuid,uuid,integer,integer)', 'EXECUTE'), false, 'anonymous cannot execute progress RPC');
select is(has_function_privilege('authenticated', 'public.get_public_certificate_file(text)', 'EXECUTE'), false, 'private certificate path resolver remains server-only');
select is(has_function_privilege('authenticated', 'public.finalize_course_certificate(uuid,text,text)', 'EXECUTE'), false, 'course certificate finalization remains server-only');
select is(has_function_privilege('authenticated', 'public.claim_notification_batch(integer)', 'EXECUTE'), false, 'notification claiming remains server-only');
select is(has_function_privilege('authenticated', 'public.register_activity_internal(uuid,jsonb)', 'EXECUTE'), false, 'registration internals remain server-only');

select is(has_table_privilege('anon', 'public.people', 'SELECT'), false, 'anonymous has no people table grant');
select is(has_table_privilege('anon', 'public.registrations', 'SELECT'), false, 'anonymous has no registrations table grant');
select is(has_table_privilege('anon', 'public.lesson_progress', 'SELECT'), false, 'anonymous has no progress table grant');
select is(has_table_privilege('authenticated', 'public.course_enrollments', 'UPDATE'), false, 'students cannot directly mutate enrollments');
select is(has_table_privilege('authenticated', 'public.lesson_progress', 'UPDATE'), false, 'students cannot directly mutate progress');
select is(has_table_privilege('authenticated', 'public.quiz_options', 'SELECT'), false, 'students cannot read quiz answers directly');
select is(has_table_privilege('authenticated', 'public.quiz_attempts', 'INSERT'), false, 'students cannot forge quiz attempts');
select is(has_table_privilege('authenticated', 'public.certificates', 'INSERT'), false, 'students cannot issue certificates directly');
select is(has_table_privilege('authenticated', 'public.course_ratings', 'INSERT'), false, 'students cannot bypass rating RPC');

select is((select public from storage.buckets where id = 'course-materials'), false, 'course materials bucket is private');
select is((select public from storage.buckets where id = 'course-videos'), false, 'course videos bucket is private');
select is((select public from storage.buckets where id = 'certificates'), false, 'certificates bucket is private');
select ok(
  exists (
    select 1 from pg_policies
    where schemaname = 'storage' and policyname = 'course_material_files_student_read'
      and qual like '%course_materials%' and qual like '%storage_path%'
  ),
  'material storage policy validates the material row and path'
);
select ok(
  exists (
    select 1 from pg_policies
    where schemaname = 'storage' and policyname = 'course_video_files_student_read'
      and qual like '%lessons%' and qual like '%video_storage_path%'
  ),
  'video storage policy validates the published lesson and path'
);
select ok(
  exists (
    select 1 from pg_policies
    where schemaname = 'storage' and policyname = 'certificates_storage_owner_read'
      and qual like '%current_person_id%'
  ),
  'certificate storage policy validates ownership'
);

insert into public.people (
  id, document_type, document_number, first_names, last_names, email, phone, job_title
) values
  ('3b000000-0000-4000-8000-000000000001', 'dni', '21000001', 'Admin', 'Seguridad', 'admin11@example.test', '921000001', 'Administradora'),
  ('3b000000-0000-4000-8000-000000000002', 'dni', '21000002', 'Operador', 'Seguridad', 'operator11@example.test', '921000002', 'Operador'),
  ('3b000000-0000-4000-8000-000000000003', 'dni', '21000003', 'Alumno', 'Propio', 'student11@example.test', '921000003', 'Analista'),
  ('3b000000-0000-4000-8000-000000000004', 'dni', '21000004', 'Alumno', 'Ajeno', 'other11@example.test', '921000004', 'Analista'),
  ('3b000000-0000-4000-8000-000000000005', 'dni', '21000005', 'Alumno', 'Inactivo', 'inactive11@example.test', '921000005', 'Analista');

insert into auth.users (id, email) values
  ('8b000000-0000-4000-8000-000000000001', 'admin11@example.test'),
  ('8b000000-0000-4000-8000-000000000002', 'operator11@example.test'),
  ('8b000000-0000-4000-8000-000000000003', 'student11@example.test'),
  ('8b000000-0000-4000-8000-000000000004', 'other11@example.test'),
  ('8b000000-0000-4000-8000-000000000005', 'inactive11@example.test');

insert into public.user_accounts (user_id, person_id, role, is_active) values
  ('8b000000-0000-4000-8000-000000000001', '3b000000-0000-4000-8000-000000000001', 'administrator', true),
  ('8b000000-0000-4000-8000-000000000002', '3b000000-0000-4000-8000-000000000002', 'operator', true),
  ('8b000000-0000-4000-8000-000000000003', '3b000000-0000-4000-8000-000000000003', 'student', true),
  ('8b000000-0000-4000-8000-000000000004', '3b000000-0000-4000-8000-000000000004', 'student', true),
  ('8b000000-0000-4000-8000-000000000005', '3b000000-0000-4000-8000-000000000005', 'student', false);

insert into public.categories (id, name, slug, is_active) values
  ('1b000000-0000-4000-8000-000000000001', 'Seguridad H11', 'seguridad-h11', true);

insert into public.speakers (id, first_names, last_names) values
  ('2b000000-0000-4000-8000-000000000001', 'Expositor', 'Público'),
  ('2b000000-0000-4000-8000-000000000002', 'Expositor', 'Interno');

insert into public.activities (
  id, category_id, type, title, slug, description, modality, is_free,
  general_price, member_price, status, published_at
) values
  ('4b000000-0000-4000-8000-000000000001', '1b000000-0000-4000-8000-000000000001', 'event', 'Evento publicado H11', 'evento-publicado-h11', 'Visible', 'virtual', true, 0, 0, 'published', now()),
  ('4b000000-0000-4000-8000-000000000002', '1b000000-0000-4000-8000-000000000001', 'event', 'Evento borrador H11', 'evento-borrador-h11', 'Privado', 'virtual', true, 0, 0, 'draft', null);

insert into public.activity_speakers (activity_id, speaker_id) values
  ('4b000000-0000-4000-8000-000000000001', '2b000000-0000-4000-8000-000000000001');

insert into public.courses (
  id, title, slug, description, is_free, general_price, member_price, status, published_at
) values
  ('5b000000-0000-4000-8000-000000000001', 'Curso propio H11', 'curso-propio-h11', 'Curso visible', true, 0, 0, 'published', now()),
  ('5b000000-0000-4000-8000-000000000002', 'Curso ajeno H11', 'curso-ajeno-h11', 'Curso visible sin acceso', true, 0, 0, 'published', now()),
  ('5b000000-0000-4000-8000-000000000003', 'Curso borrador H11', 'curso-borrador-h11', 'Curso privado', true, 0, 0, 'draft', null);

insert into public.course_modules (id, course_id, title, is_published) values
  ('6b000000-0000-4000-8000-000000000001', '5b000000-0000-4000-8000-000000000001', 'Módulo propio', true),
  ('6b000000-0000-4000-8000-000000000002', '5b000000-0000-4000-8000-000000000002', 'Módulo ajeno', true);

insert into public.lessons (
  id, module_id, title, video_provider, video_storage_path, duration_seconds, is_published
) values
  ('7b000000-0000-4000-8000-000000000001', '6b000000-0000-4000-8000-000000000001', 'Clase propia', 'supabase', '5b000000-0000-4000-8000-000000000001/lesson.mp4', 100, true),
  ('7b000000-0000-4000-8000-000000000002', '6b000000-0000-4000-8000-000000000002', 'Clase ajena', 'supabase', '5b000000-0000-4000-8000-000000000002/lesson.mp4', 100, true);

insert into public.course_materials (
  id, course_id, title, material_type, storage_path
) values
  ('ab000000-0000-4000-8000-000000000001', '5b000000-0000-4000-8000-000000000001', 'Material propio', 'file', '5b000000-0000-4000-8000-000000000001/material.pdf'),
  ('ab000000-0000-4000-8000-000000000002', '5b000000-0000-4000-8000-000000000002', 'Material ajeno', 'file', '5b000000-0000-4000-8000-000000000002/material.pdf');

insert into public.course_enrollments (id, course_id, person_id, status) values
  ('9b000000-0000-4000-8000-000000000001', '5b000000-0000-4000-8000-000000000001', '3b000000-0000-4000-8000-000000000003', 'active'),
  ('9b000000-0000-4000-8000-000000000002', '5b000000-0000-4000-8000-000000000002', '3b000000-0000-4000-8000-000000000004', 'active'),
  ('9b000000-0000-4000-8000-000000000003', '5b000000-0000-4000-8000-000000000001', '3b000000-0000-4000-8000-000000000005', 'active');

alter table public.lesson_progress disable trigger enforce_lesson_progress_increment;
insert into public.lesson_progress (
  id, enrollment_id, lesson_id, duration_seconds_snapshot, progress_percent, last_watched_at
) values
  ('cb000000-0000-4000-8000-000000000001', '9b000000-0000-4000-8000-000000000001', '7b000000-0000-4000-8000-000000000001', 100, 10, now()),
  ('cb000000-0000-4000-8000-000000000002', '9b000000-0000-4000-8000-000000000002', '7b000000-0000-4000-8000-000000000002', 100, 10, now());
alter table public.lesson_progress enable trigger enforce_lesson_progress_increment;

insert into public.audit_logs (id, action, entity_type) values
  ('db000000-0000-4000-8000-000000000001', 'security.test', 'hito_11');

set local role anon;
select is((select count(*) from public.activities where id in ('4b000000-0000-4000-8000-000000000001', '4b000000-0000-4000-8000-000000000002')), 1::bigint, 'anonymous sees published activity but not draft');
select is((select count(*) from public.courses where id in ('5b000000-0000-4000-8000-000000000001', '5b000000-0000-4000-8000-000000000003')), 1::bigint, 'anonymous sees published course but not draft');
select is((select count(*) from public.speakers where id in ('2b000000-0000-4000-8000-000000000001', '2b000000-0000-4000-8000-000000000002')), 1::bigint, 'anonymous sees only speakers related to public content');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '8b000000-0000-4000-8000-000000000003', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select is(public.current_user_role(), 'student'::public.user_role, 'student role resolves from active account');
select is(public.current_person_id(), '3b000000-0000-4000-8000-000000000003'::uuid, 'student person resolves from active account');
select is((select count(*) from public.people where id in ('3b000000-0000-4000-8000-000000000003', '3b000000-0000-4000-8000-000000000004')), 1::bigint, 'student reads only own person');
select is((select count(*) from public.course_enrollments where id in ('9b000000-0000-4000-8000-000000000001', '9b000000-0000-4000-8000-000000000002')), 1::bigint, 'student reads only own enrollment');
select is((select count(*) from public.lessons where id in ('7b000000-0000-4000-8000-000000000001', '7b000000-0000-4000-8000-000000000002')), 1::bigint, 'student reads only lessons from enrolled course');
select is((select count(*) from public.course_materials where id in ('ab000000-0000-4000-8000-000000000001', 'ab000000-0000-4000-8000-000000000002')), 1::bigint, 'student reads only materials from enrolled course');
select is((select count(*) from public.lesson_progress where id in ('cb000000-0000-4000-8000-000000000001', 'cb000000-0000-4000-8000-000000000002')), 1::bigint, 'student reads only own progress');
select throws_ok(
  $$select public.save_course('{}'::jsonb, '[]'::jsonb)$$,
  '42501', 'UNAUTHORIZED', 'student cannot execute an administrative mutation'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '8b000000-0000-4000-8000-000000000005', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select is(public.current_user_role(), null::public.user_role, 'inactive account has no effective role');
select is(public.current_person_id(), null::uuid, 'inactive account has no effective person');
select is((select count(*) from public.people where id = '3b000000-0000-4000-8000-000000000005'), 0::bigint, 'inactive account cannot read its person');
select is((select count(*) from public.course_enrollments where id = '9b000000-0000-4000-8000-000000000003'), 0::bigint, 'inactive account cannot read its enrollment');
select is((select count(*) from public.lessons where id = '7b000000-0000-4000-8000-000000000001'), 0::bigint, 'inactive account cannot read private lessons');
select throws_ok(
  $$select public.enroll_free_course('5b000000-0000-4000-8000-000000000001'::uuid)$$,
  '42501', 'ACCOUNT_NOT_ACTIVE', 'inactive account cannot enroll'
);
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '8b000000-0000-4000-8000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select ok(public.is_internal_user(), 'operator is recognized as internal');
select is(public.is_administrator(), false, 'operator is not administrator');
select is((select count(*) from public.people where id in ('3b000000-0000-4000-8000-000000000003', '3b000000-0000-4000-8000-000000000004')), 2::bigint, 'operator can read participants');
select is((select count(*) from public.audit_logs where id = 'db000000-0000-4000-8000-000000000001'), 0::bigint, 'operator cannot read audit log');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '8b000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select ok(public.is_internal_user(), 'administrator is recognized as internal');
select ok(public.is_administrator(), 'administrator is recognized correctly');
select is((select count(*) from public.audit_logs where id = 'db000000-0000-4000-8000-000000000001'), 1::bigint, 'administrator can read audit log');
reset role;

select * from finish(true);
rollback;
