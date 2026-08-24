begin;

select no_plan();

select has_table('public', 'lesson_progress', 'lesson progress table exists');
select has_column('public', 'lesson_progress', 'enrollment_id', 'progress belongs to an enrollment');
select has_column('public', 'lesson_progress', 'lesson_id', 'progress belongs to a lesson');
select has_column('public', 'lesson_progress', 'last_position_seconds', 'last position is persisted');
select has_column('public', 'lesson_progress', 'watched_seconds', 'watched seconds are persisted');
select has_column('public', 'lesson_progress', 'progress_percent', 'lesson percentage is persisted');
select has_column('public', 'lesson_progress', 'is_completed', 'completion state is persisted');
select has_column('public', 'lesson_progress', 'completed_at', 'completion timestamp is persisted');
select ok(
  to_regprocedure('public.update_lesson_progress(uuid,uuid,integer,integer)') is not null,
  'lesson progress RPC exists'
);
select ok(
  to_regprocedure('public.check_course_completion(uuid)') is not null,
  'course completion check exists'
);
select ok(
  exists (select 1 from pg_indexes where indexname = 'uq_lesson_progress_active'),
  'active progress is unique by enrollment and lesson'
);
select ok(
  exists (select 1 from pg_indexes where indexname = 'idx_lesson_progress_enrollment'),
  'enrollment progress index exists'
);
select ok(
  exists (select 1 from pg_indexes where indexname = 'idx_lesson_progress_lesson'),
  'lesson progress index exists'
);
select ok(
  exists (
    select 1 from pg_trigger
    where tgname = 'set_lesson_progress_updated_at' and not tgisinternal
  ),
  'lesson progress updated_at trigger exists'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.lesson_progress'::regclass),
  'lesson progress uses RLS'
);
select is(
  has_table_privilege('authenticated', 'public.lesson_progress', 'INSERT'),
  false,
  'students cannot insert progress directly'
);
select is(
  has_table_privilege('authenticated', 'public.lesson_progress', 'UPDATE'),
  false,
  'students cannot update progress directly'
);

insert into public.people (
  id, document_type, document_number, first_names, last_names, email, phone, job_title
) values
  (
    '38000000-0000-4000-8000-000000000001', 'dni', '18000001',
    'Alumno', 'Progreso', 'student8@example.test', '918000001', 'Analista'
  ),
  (
    '38000000-0000-4000-8000-000000000002', 'dni', '18000002',
    'Otro', 'Alumno', 'other8@example.test', '918000002', 'Analista'
  );

insert into auth.users (id, email) values
  ('88000000-0000-4000-8000-000000000001', 'student8@example.test'),
  ('88000000-0000-4000-8000-000000000002', 'other8@example.test');

insert into public.user_accounts (user_id, person_id, role) values
  (
    '88000000-0000-4000-8000-000000000001',
    '38000000-0000-4000-8000-000000000001',
    'student'
  ),
  (
    '88000000-0000-4000-8000-000000000002',
    '38000000-0000-4000-8000-000000000002',
    'student'
  );

insert into public.courses (
  id, title, slug, description, is_free, general_price, member_price, status, published_at
) values
  (
    '58000000-0000-4000-8000-000000000001', 'Curso de progreso',
    'curso-de-progreso', 'Curso principal del Hito 8', true, 0, 0, 'published', now()
  ),
  (
    '58000000-0000-4000-8000-000000000002', 'Curso ajeno',
    'curso-ajeno-progreso', 'Curso utilizado para validar pertenencia', true, 0, 0,
    'published', now()
  );

insert into public.course_modules (
  id, course_id, title, sort_order, is_published
) values
  (
    '68000000-0000-4000-8000-000000000001',
    '58000000-0000-4000-8000-000000000001', 'Módulo principal', 0, true
  ),
  (
    '68000000-0000-4000-8000-000000000002',
    '58000000-0000-4000-8000-000000000002', 'Módulo ajeno', 0, true
  );

insert into public.lessons (
  id, module_id, title, sort_order, duration_seconds, is_required, is_published
) values
  (
    '78000000-0000-4000-8000-000000000001',
    '68000000-0000-4000-8000-000000000001', 'Clase obligatoria 1', 0, 100, true, true
  ),
  (
    '78000000-0000-4000-8000-000000000002',
    '68000000-0000-4000-8000-000000000001', 'Clase obligatoria 2', 1, 100, true, true
  ),
  (
    '78000000-0000-4000-8000-000000000003',
    '68000000-0000-4000-8000-000000000001', 'Clase opcional', 2, 100, false, true
  ),
  (
    '78000000-0000-4000-8000-000000000004',
    '68000000-0000-4000-8000-000000000002', 'Clase de otro curso', 0, 100, true, true
  );

insert into public.course_enrollments (id, course_id, person_id, status) values
  (
    '98000000-0000-4000-8000-000000000001',
    '58000000-0000-4000-8000-000000000001',
    '38000000-0000-4000-8000-000000000001', 'active'
  ),
  (
    '98000000-0000-4000-8000-000000000002',
    '58000000-0000-4000-8000-000000000001',
    '38000000-0000-4000-8000-000000000002', 'active'
  );

set local role authenticated;
select set_config('request.jwt.claim.sub', '88000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select lives_ok(
  $$select public.update_lesson_progress(
    '98000000-0000-4000-8000-000000000001',
    '78000000-0000-4000-8000-000000000001', 30, 30
  )$$,
  'first playback creates progress through the RPC'
);
select is(
  (select count(*) from public.lesson_progress),
  1::bigint,
  'first interaction creates one progress row'
);
select is(
  (select watched_seconds from public.lesson_progress),
  30,
  'first playback stores watched seconds'
);
select is(
  (select progress_percent from public.lesson_progress),
  30::numeric,
  'server calculates the initial percentage'
);
select isnt(
  (select is_completed from public.lesson_progress),
  true,
  'a partially watched lesson is not completed'
);

reset role;
update public.lesson_progress
set last_watched_at = now() - interval '30 seconds'
where lesson_id = '78000000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub', '88000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select lives_ok(
  $$select public.update_lesson_progress(
    '98000000-0000-4000-8000-000000000001',
    '78000000-0000-4000-8000-000000000001', 60, 60
  )$$,
  'periodic playback update is accepted'
);
reset role;
update public.lesson_progress
set last_watched_at = now() - interval '30 seconds'
where lesson_id = '78000000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub', '88000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select lives_ok(
  $$select public.update_lesson_progress(
    '98000000-0000-4000-8000-000000000001',
    '78000000-0000-4000-8000-000000000001', 89, 89
  )$$,
  'progress can reach 89 percent'
);
select is(
  (select progress_percent from public.lesson_progress),
  89::numeric,
  '89 percent is calculated accurately'
);
select isnt(
  (select is_completed from public.lesson_progress),
  true,
  '89 percent does not complete the lesson'
);
select is(
  (select completed_at from public.lesson_progress),
  null::timestamptz,
  '89 percent has no completion timestamp'
);

select lives_ok(
  $$select public.update_lesson_progress(
    '98000000-0000-4000-8000-000000000001',
    '78000000-0000-4000-8000-000000000001', 90, 90
  )$$,
  'progress can reach the completion threshold'
);
select ok(
  (select is_completed from public.lesson_progress),
  '90 percent completes the lesson automatically'
);
select ok(
  (select completed_at is not null from public.lesson_progress),
  'completion stores its first timestamp'
);

select lives_ok(
  $$select public.update_lesson_progress(
    '98000000-0000-4000-8000-000000000001',
    '78000000-0000-4000-8000-000000000001', 30, 30
  )$$,
  'a completed lesson can be reviewed from an earlier position'
);
select is(
  (select last_position_seconds from public.lesson_progress),
  30,
  'resume position may move backwards'
);
select is(
  (select progress_percent from public.lesson_progress),
  90::numeric,
  'recognized academic progress does not regress'
);
select ok(
  (select is_completed from public.lesson_progress),
  'reviewing an earlier position preserves completion'
);

select lives_ok(
  $$select public.update_lesson_progress(
    '98000000-0000-4000-8000-000000000001',
    '78000000-0000-4000-8000-000000000002', 100, 100
  )$$,
  'an attempted one-call completion is handled safely'
);
select is(
  (
    select watched_seconds from public.lesson_progress
    where lesson_id = '78000000-0000-4000-8000-000000000002'
  ),
  30,
  'one RPC call recognizes at most the trusted interval'
);
select isnt(
  (
    select is_completed from public.lesson_progress
    where lesson_id = '78000000-0000-4000-8000-000000000002'
  ),
  true,
  'the browser cannot complete a lesson in one manipulated request'
);
select is(
  (
    select progress_percent from public.course_enrollments
    where id = '98000000-0000-4000-8000-000000000001'
  ),
  60::numeric,
  'course progress averages only required published lessons'
);
select lives_ok(
  $$select public.update_lesson_progress(
    '98000000-0000-4000-8000-000000000001',
    '78000000-0000-4000-8000-000000000002', 100, 100
  )$$,
  'a rapid repeated manipulated request is handled safely'
);
select is(
  (
    select watched_seconds from public.lesson_progress
    where lesson_id = '78000000-0000-4000-8000-000000000002'
  ),
  32,
  'rapid requests only recognize a small playback tolerance'
);
select is(
  (
    select progress_percent from public.course_enrollments
    where id = '98000000-0000-4000-8000-000000000001'
  ),
  61::numeric,
  'rate-guarded lesson progress is reflected consistently in the course'
);

select lives_ok(
  $$select public.update_lesson_progress(
    '98000000-0000-4000-8000-000000000001',
    '78000000-0000-4000-8000-000000000003', 30, 30
  )$$,
  'optional lesson progress can be stored'
);
select is(
  (
    select progress_percent from public.course_enrollments
    where id = '98000000-0000-4000-8000-000000000001'
  ),
  61::numeric,
  'optional lessons do not affect course progress'
);
select isnt(
  public.check_course_completion('98000000-0000-4000-8000-000000000001'),
  true,
  'course completion remains pending while a required lesson is incomplete'
);

select throws_ok(
  $$select public.update_lesson_progress(
    '98000000-0000-4000-8000-000000000001',
    '78000000-0000-4000-8000-000000000004', 10, 10
  )$$,
  'P0001', 'LESSON_ENROLLMENT_MISMATCH',
  'an enrollment cannot update a lesson from another course'
);
select throws_ok(
  $$select public.update_lesson_progress(
    '98000000-0000-4000-8000-000000000002',
    '78000000-0000-4000-8000-000000000001', 10, 10
  )$$,
  '42501', 'UNAUTHORIZED',
  'a student cannot update another student progress'
);
select throws_ok(
  $$select public.update_lesson_progress(
    '98000000-0000-4000-8000-000000000001',
    '78000000-0000-4000-8000-000000000001', 101, 100
  )$$,
  '22023', 'POSITION_EXCEEDS_DURATION',
  'position is validated against the stored lesson duration'
);

reset role;
update public.course_enrollments
set status = 'revoked', revoked_at = now()
where id = '98000000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub', '88000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select throws_ok(
  $$select public.update_lesson_progress(
    '98000000-0000-4000-8000-000000000001',
    '78000000-0000-4000-8000-000000000001', 95, 95
  )$$,
  'P0001', 'ENROLLMENT_NOT_ACTIVE',
  'a revoked enrollment cannot accumulate progress'
);
select is(
  (select count(*) from public.lesson_progress),
  3::bigint,
  'revocation preserves historical lesson progress'
);

select * from finish(true);
rollback;
