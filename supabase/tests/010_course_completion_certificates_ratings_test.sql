begin;

select no_plan();

select has_table('public', 'course_ratings', 'course ratings table exists');
select has_column('public', 'course_ratings', 'enrollment_id', 'rating preserves its completed enrollment');
select ok(to_regprocedure('public.check_course_completion(uuid)') is not null, 'definitive completion RPC exists');
select ok(to_regprocedure('public.get_my_certificates()') is not null, 'student certificates RPC exists');
select ok(to_regprocedure('public.finalize_course_certificate(uuid,text,text)') is not null, 'course PDF finalization RPC exists');
select ok(to_regprocedure('public.save_course_rating(uuid,smallint,text)') is not null, 'rating save RPC exists');
select ok(exists (select 1 from pg_indexes where indexname = 'uq_certificates_course_enrollment_active'), 'one certificate per course enrollment is enforced');
select ok(exists (select 1 from pg_indexes where indexname = 'uq_course_rating_active'), 'one active rating per person and course is enforced');
select ok(exists (select 1 from pg_trigger where tgname = 'set_course_ratings_updated_at' and not tgisinternal), 'rating updated_at trigger exists');
select is(has_table_privilege('authenticated', 'public.course_ratings', 'INSERT'), false, 'students cannot bypass rating RPC');
select is(has_table_privilege('authenticated', 'public.certificates', 'INSERT'), false, 'students cannot issue certificates directly');
select ok(exists (
  select 1 from public.certificate_templates
  where scope = 'course' and is_active and deleted_at is null
), 'an active course certificate template exists');
select ok(exists (
  select 1 from public.certificate_template_signers signer
  join public.certificate_templates template on template.id = signer.template_id
  where template.scope = 'course' and template.is_active and template.deleted_at is null
    and signer.deleted_at is null
), 'course template reuses institutional signers');

insert into public.people (
  id, document_type, document_number, first_names, last_names, email, phone, job_title
) values
  ('3a000000-0000-4000-8000-000000000001', 'dni', '20000001', 'Admin', 'Finalización', 'admin10@example.test', '920000001', 'Administradora'),
  ('3a000000-0000-4000-8000-000000000002', 'dni', '20000002', 'Alumno', 'Completo', 'student10@example.test', '920000002', 'Analista'),
  ('3a000000-0000-4000-8000-000000000003', 'dni', '20000003', 'Otro', 'Alumno', 'other10@example.test', '920000003', 'Analista');

insert into auth.users (id, email) values
  ('8a000000-0000-4000-8000-000000000001', 'admin10@example.test'),
  ('8a000000-0000-4000-8000-000000000002', 'student10@example.test'),
  ('8a000000-0000-4000-8000-000000000003', 'other10@example.test');

insert into public.user_accounts (user_id, person_id, role) values
  ('8a000000-0000-4000-8000-000000000001', '3a000000-0000-4000-8000-000000000001', 'administrator'),
  ('8a000000-0000-4000-8000-000000000002', '3a000000-0000-4000-8000-000000000002', 'student'),
  ('8a000000-0000-4000-8000-000000000003', '3a000000-0000-4000-8000-000000000003', 'student');

insert into public.courses (
  id, title, slug, description, academic_hours, is_free, general_price, member_price, status, published_at
) values
  ('5a000000-0000-4000-8000-000000000001', 'Curso sin quiz H10', 'curso-sin-quiz-h10', 'Finalización por clases', 12, true, 0, 0, 'published', now()),
  ('5a000000-0000-4000-8000-000000000002', 'Curso con quiz H10', 'curso-con-quiz-h10', 'Finalización con evaluación', 20, true, 0, 0, 'published', now());

insert into public.course_modules (id, course_id, title, sort_order, is_published) values
  ('6a000000-0000-4000-8000-000000000001', '5a000000-0000-4000-8000-000000000001', 'Módulo sin quiz', 0, true),
  ('6a000000-0000-4000-8000-000000000002', '5a000000-0000-4000-8000-000000000002', 'Módulo con quiz', 0, true);

insert into public.lessons (
  id, module_id, title, sort_order, duration_seconds, is_required, is_published
) values
  ('7a000000-0000-4000-8000-000000000001', '6a000000-0000-4000-8000-000000000001', 'Clase obligatoria', 0, 100, true, true),
  ('7a000000-0000-4000-8000-000000000002', '6a000000-0000-4000-8000-000000000001', 'Clase opcional', 1, 100, false, true),
  ('7a000000-0000-4000-8000-000000000003', '6a000000-0000-4000-8000-000000000002', 'Clase evaluada', 0, 100, true, true);

insert into public.course_enrollments (id, course_id, person_id, status) values
  ('9a000000-0000-4000-8000-000000000001', '5a000000-0000-4000-8000-000000000001', '3a000000-0000-4000-8000-000000000002', 'active'),
  ('9a000000-0000-4000-8000-000000000002', '5a000000-0000-4000-8000-000000000002', '3a000000-0000-4000-8000-000000000002', 'active');

insert into public.course_enrollments (
  id, course_id, person_id, status, revoked_at, revocation_reason
) values (
  '9a000000-0000-4000-8000-000000000003',
  '5a000000-0000-4000-8000-000000000001',
  '3a000000-0000-4000-8000-000000000003',
  'revoked', now(), 'Revocación de prueba'
);

alter table public.lesson_progress disable trigger enforce_lesson_progress_increment;
insert into public.lesson_progress (
  enrollment_id, lesson_id, last_position_seconds, watched_seconds,
  duration_seconds_snapshot, progress_percent, is_completed, completed_at, last_watched_at
) values
  ('9a000000-0000-4000-8000-000000000001', '7a000000-0000-4000-8000-000000000001', 90, 90, 100, 90, true, now(), now()),
  ('9a000000-0000-4000-8000-000000000002', '7a000000-0000-4000-8000-000000000003', 90, 90, 100, 90, true, now(), now()),
  ('9a000000-0000-4000-8000-000000000003', '7a000000-0000-4000-8000-000000000001', 90, 90, 100, 90, true, now(), now());
alter table public.lesson_progress enable trigger enforce_lesson_progress_increment;

insert into public.quizzes (id, module_id, title, is_published) values
  ('4a000000-0000-4000-8000-000000000001', '6a000000-0000-4000-8000-000000000002', 'Evaluación final', true);

set local role authenticated;
select set_config('request.jwt.claim.sub', '8a000000-0000-4000-8000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select isnt(public.check_course_completion('9a000000-0000-4000-8000-000000000002'), true, 'pending quiz prevents completion');
reset role;
select is((select status from public.course_enrollments where id = '9a000000-0000-4000-8000-000000000002'), 'active'::public.course_enrollment_status, 'pending course remains active');
select is((select count(*) from public.certificates where course_enrollment_id = '9a000000-0000-4000-8000-000000000002'), 0::bigint, 'pending course creates no certificate');

set local role authenticated;
select set_config('request.jwt.claim.sub', '8a000000-0000-4000-8000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select ok(public.check_course_completion('9a000000-0000-4000-8000-000000000001'), 'required lessons complete a course without quizzes');
reset role;
select is((select status from public.course_enrollments where id = '9a000000-0000-4000-8000-000000000001'), 'completed'::public.course_enrollment_status, 'eligible enrollment becomes completed');
select is((select progress_percent from public.course_enrollments where id = '9a000000-0000-4000-8000-000000000001'), 100::numeric, 'completed enrollment is forced to 100 percent');
select ok((select completed_at is not null from public.course_enrollments where id = '9a000000-0000-4000-8000-000000000001'), 'completion timestamp is stored');
select is((select count(*) from public.lesson_progress where enrollment_id = '9a000000-0000-4000-8000-000000000001' and lesson_id = '7a000000-0000-4000-8000-000000000002'), 0::bigint, 'optional lesson is not required');
select is((select count(*) from public.certificates where course_enrollment_id = '9a000000-0000-4000-8000-000000000001'), 1::bigint, 'completion creates one automatic certificate');
select is((select certificate_type from public.certificates where course_enrollment_id = '9a000000-0000-4000-8000-000000000001'), 'course'::public.certificate_type, 'automatic certificate uses course type');
select ok((select registration_id is null from public.certificates where course_enrollment_id = '9a000000-0000-4000-8000-000000000001'), 'course certificate has no activity origin');
select is((select participant_name_snapshot from public.certificates where course_enrollment_id = '9a000000-0000-4000-8000-000000000001'), 'Alumno Completo', 'participant name is snapshotted');
select is((select title_snapshot from public.certificates where course_enrollment_id = '9a000000-0000-4000-8000-000000000001'), 'Curso sin quiz H10', 'course title is snapshotted');
select is((select academic_hours_snapshot from public.certificates where course_enrollment_id = '9a000000-0000-4000-8000-000000000001'), 12::numeric, 'academic hours are snapshotted');
select is((select date_text_snapshot from public.certificates where course_enrollment_id = '9a000000-0000-4000-8000-000000000001'), null::text, 'virtual course certificate omits dates');
select ok((select certificate_code like 'CCI-CUR-%' from public.certificates where course_enrollment_id = '9a000000-0000-4000-8000-000000000001'), 'course certificate receives its institutional code');

select set_config('test.completed_at', (select completed_at::text from public.course_enrollments where id = '9a000000-0000-4000-8000-000000000001'), true);
select set_config('test.certificate_id', (select id::text from public.certificates where course_enrollment_id = '9a000000-0000-4000-8000-000000000001'), true);
set local role authenticated;
select set_config('request.jwt.claim.sub', '8a000000-0000-4000-8000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select ok(public.check_course_completion('9a000000-0000-4000-8000-000000000001'), 'completed course can be checked again');
reset role;
select is((select completed_at::text from public.course_enrollments where id = '9a000000-0000-4000-8000-000000000001'), current_setting('test.completed_at'), 'idempotency preserves completed_at');
select is((select count(*) from public.certificates where course_enrollment_id = '9a000000-0000-4000-8000-000000000001'), 1::bigint, 'idempotency prevents duplicate certificates');
select is((select id::text from public.certificates where course_enrollment_id = '9a000000-0000-4000-8000-000000000001'), current_setting('test.certificate_id'), 'idempotency preserves the original certificate');

set local role authenticated;
select set_config('request.jwt.claim.sub', '8a000000-0000-4000-8000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select is(jsonb_array_length(public.get_my_certificates()), 1, 'student sees certificate in institutional history');
select ok((public.get_my_course_certificate('5a000000-0000-4000-8000-000000000001')->>'file_ready')::boolean = false, 'certificate initially exposes generation pending state');
select ok(public.authorize_course_certificate_generation(nullif(current_setting('test.certificate_id'), '')::uuid), 'owner can authorize document generation');
select lives_ok($$select public.save_course_rating('5a000000-0000-4000-8000-000000000001'::uuid, 5::smallint, 'Excelente curso')$$, 'completed student can rate course');
select is((public.get_my_course_rating('5a000000-0000-4000-8000-000000000001')->>'rating')::integer, 5, 'saved rating is returned');
select set_config('test.rating_id', public.save_course_rating('5a000000-0000-4000-8000-000000000001'::uuid, 4::smallint, 'Comentario editado')::text, true);
select is((public.get_my_course_rating('5a000000-0000-4000-8000-000000000001')->>'rating')::integer, 4, 'rating can be edited');
select throws_ok(
  $$select public.save_course_rating('5a000000-0000-4000-8000-000000000002'::uuid, 5::smallint, null)$$,
  '42501', 'COURSE_NOT_COMPLETED', 'active enrollment cannot rate'
);
reset role;
select is((select count(*) from public.course_ratings where course_id = '5a000000-0000-4000-8000-000000000001' and deleted_at is null), 1::bigint, 'editing does not create a second active rating');
select is((select comment from public.course_ratings where id::text = current_setting('test.rating_id')), 'Comentario editado', 'rating comment is editable');
select throws_ok(
  $$insert into public.course_ratings (course_id, person_id, enrollment_id, rating) values ('5a000000-0000-4000-8000-000000000001','3a000000-0000-4000-8000-000000000002','9a000000-0000-4000-8000-000000000001',6)$$,
  '23514', null, 'database rejects rating outside one to five'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '8a000000-0000-4000-8000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select ok(public.delete_course_rating('5a000000-0000-4000-8000-000000000001'), 'student can soft-delete own rating');
select is(public.get_my_course_rating('5a000000-0000-4000-8000-000000000001'), null::jsonb, 'deleted rating is absent');

reset role;
insert into public.quiz_attempts (
  quiz_id, enrollment_id, attempt_number, score_percent, correct_answers, total_questions, is_passed
) values
  ('4a000000-0000-4000-8000-000000000001', '9a000000-0000-4000-8000-000000000002', 1, 100, 1, 1, true),
  ('4a000000-0000-4000-8000-000000000001', '9a000000-0000-4000-8000-000000000002', 2, 0, 0, 1, false);
set local role authenticated;
select set_config('request.jwt.claim.sub', '8a000000-0000-4000-8000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select ok(public.check_course_completion('9a000000-0000-4000-8000-000000000002'), 'historical passing attempt completes quiz course');
reset role;
select is((select status from public.course_enrollments where id = '9a000000-0000-4000-8000-000000000002'), 'completed'::public.course_enrollment_status, 'quiz course becomes completed');
select is((select count(*) from public.certificates where course_enrollment_id = '9a000000-0000-4000-8000-000000000002'), 1::bigint, 'quiz course receives certificate');

set local role authenticated;
select set_config('request.jwt.claim.sub', '8a000000-0000-4000-8000-000000000003', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select isnt(public.check_course_completion('9a000000-0000-4000-8000-000000000003'), true, 'revoked enrollment never completes');
select isnt(public.authorize_course_certificate_generation(nullif(current_setting('test.certificate_id'), '')::uuid), true, 'another student cannot generate certificate');
select is(jsonb_array_length(public.get_my_certificates()), 0, 'another student cannot see certificates');
select throws_ok(
  $$select public.save_course_rating('5a000000-0000-4000-8000-000000000001'::uuid, 5::smallint, null)$$,
  '42501', 'COURSE_NOT_COMPLETED', 'revoked student cannot rate'
);
reset role;
select is((select status from public.course_enrollments where id = '9a000000-0000-4000-8000-000000000003'), 'revoked'::public.course_enrollment_status, 'revoked status remains unchanged');
select is((select count(*) from public.certificates where course_enrollment_id = '9a000000-0000-4000-8000-000000000003'), 0::bigint, 'revoked enrollment has no certificate');

set local role service_role;
select set_config('request.jwt.claim.role', 'service_role', true);
select lives_ok(
  $$select public.finalize_course_certificate(nullif(current_setting('test.certificate_id'), '')::uuid, 'issued/test/course.pdf', 'https://example.test')$$,
  'service finalizes generated course PDF'
);
select lives_ok(
  $$select public.finalize_course_certificate(nullif(current_setting('test.certificate_id'), '')::uuid, 'issued/test/other.pdf', 'https://example.test')$$,
  'repeated PDF finalization is idempotent'
);
reset role;
select is((select file_path from public.certificates where id::text = current_setting('test.certificate_id')), 'issued/test/course.pdf', 'first PDF path remains authoritative');
select is((select count(*) from public.notification_outbox where related_entity_id::text = current_setting('test.certificate_id') and event_type = 'course_certificate_issued'), 1::bigint, 'course certificate notification is queued once');
select ok((select payload ? 'certificate_url' from public.notification_outbox where related_entity_id::text = current_setting('test.certificate_id')), 'n8n payload includes certificate URL');

set local role authenticated;
select set_config('request.jwt.claim.sub', '8a000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select lives_ok(
  $$select public.revoke_certificate(nullif(current_setting('test.certificate_id'), '')::uuid, 'Revocación de prueba')$$,
  'administrator can revoke course certificate'
);
reset role;
select is((select status from public.certificates where id::text = current_setting('test.certificate_id')), 'revoked'::public.certificate_status, 'course certificate is revoked');
select is((select status from public.course_enrollments where id = '9a000000-0000-4000-8000-000000000001'), 'completed'::public.course_enrollment_status, 'revocation does not uncomplete course');

select * from finish(true);
rollback;
