begin;

select no_plan();

select has_table('public', 'quizzes', 'quizzes table exists');
select has_table('public', 'quiz_questions', 'quiz questions table exists');
select has_table('public', 'quiz_options', 'quiz options table exists');
select has_table('public', 'quiz_attempts', 'quiz attempts table exists');
select has_table('public', 'quiz_attempt_answers', 'quiz attempt answers table exists');
select ok(to_regprocedure('public.save_quiz(jsonb,jsonb)') is not null, 'admin quiz RPC exists');
select ok(
  to_regprocedure('public.get_student_quiz(uuid,uuid)') is not null,
  'safe student quiz RPC exists'
);
select ok(
  to_regprocedure('public.submit_quiz_attempt(uuid,uuid,jsonb)') is not null,
  'quiz attempt RPC exists'
);
select ok(
  exists (select 1 from pg_indexes where indexname = 'uq_module_quiz_active'),
  'one active quiz per module is enforced'
);
select ok(
  exists (select 1 from pg_indexes where indexname = 'uq_quiz_option_correct_active'),
  'at most one active correct option is enforced'
);
select ok(
  exists (select 1 from pg_indexes where indexname = 'uq_quiz_attempt_number_active'),
  'attempt numbering is unique'
);
select ok(
  exists (select 1 from pg_trigger where tgname = 'set_quizzes_updated_at' and not tgisinternal),
  'quiz updated_at trigger exists'
);
select is(has_table_privilege('authenticated', 'public.quiz_options', 'SELECT'), false,
  'students cannot query options or is_correct directly');
select is(has_table_privilege('authenticated', 'public.quiz_attempts', 'INSERT'), false,
  'students cannot insert calculated attempts directly');
select is(has_table_privilege('authenticated', 'public.quiz_attempts', 'UPDATE'), false,
  'submitted attempts cannot be edited directly');

insert into public.people (
  id, document_type, document_number, first_names, last_names, email, phone, job_title
) values
  ('39000000-0000-4000-8000-000000000001', 'dni', '19000001', 'Admin', 'Quiz', 'admin9@example.test', '919000001', 'Administradora'),
  ('39000000-0000-4000-8000-000000000002', 'dni', '19000002', 'Alumno', 'Quiz', 'student9@example.test', '919000002', 'Analista'),
  ('39000000-0000-4000-8000-000000000003', 'dni', '19000003', 'Sin', 'Matrícula', 'other9@example.test', '919000003', 'Analista');

insert into auth.users (id, email) values
  ('89000000-0000-4000-8000-000000000001', 'admin9@example.test'),
  ('89000000-0000-4000-8000-000000000002', 'student9@example.test'),
  ('89000000-0000-4000-8000-000000000003', 'other9@example.test');

insert into public.user_accounts (user_id, person_id, role) values
  ('89000000-0000-4000-8000-000000000001', '39000000-0000-4000-8000-000000000001', 'administrator'),
  ('89000000-0000-4000-8000-000000000002', '39000000-0000-4000-8000-000000000002', 'student'),
  ('89000000-0000-4000-8000-000000000003', '39000000-0000-4000-8000-000000000003', 'student');

insert into public.courses (
  id, title, slug, description, is_free, general_price, member_price, status, published_at
) values
  ('59000000-0000-4000-8000-000000000001', 'Curso con quiz', 'curso-con-quiz-h9', 'Curso principal', true, 0, 0, 'published', now()),
  ('59000000-0000-4000-8000-000000000002', 'Curso sin quiz', 'curso-sin-quiz-h9', 'Curso alterno', true, 0, 0, 'published', now());

insert into public.course_modules (id, course_id, title, sort_order, is_published) values
  ('69000000-0000-4000-8000-000000000001', '59000000-0000-4000-8000-000000000001', 'Módulo evaluado', 0, true),
  ('69000000-0000-4000-8000-000000000002', '59000000-0000-4000-8000-000000000002', 'Módulo sin evaluación', 0, true);

insert into public.lessons (
  id, module_id, title, sort_order, duration_seconds, is_required, is_published
) values
  ('79000000-0000-4000-8000-000000000001', '69000000-0000-4000-8000-000000000001', 'Clase requerida', 0, 1, true, true),
  ('79000000-0000-4000-8000-000000000002', '69000000-0000-4000-8000-000000000002', 'Clase sin quiz', 0, 1, true, true);

insert into public.course_enrollments (id, course_id, person_id, status) values
  ('99000000-0000-4000-8000-000000000001', '59000000-0000-4000-8000-000000000001', '39000000-0000-4000-8000-000000000002', 'active'),
  ('99000000-0000-4000-8000-000000000002', '59000000-0000-4000-8000-000000000002', '39000000-0000-4000-8000-000000000002', 'active');

insert into public.lesson_progress (
  enrollment_id, lesson_id, last_position_seconds, watched_seconds,
  duration_seconds_snapshot, progress_percent, is_completed, completed_at, last_watched_at
) values
  ('99000000-0000-4000-8000-000000000001', '79000000-0000-4000-8000-000000000001', 1, 1, 1, 100, true, now(), now()),
  ('99000000-0000-4000-8000-000000000002', '79000000-0000-4000-8000-000000000002', 1, 1, 1, 100, true, now(), now());

set local role authenticated;
select set_config('request.jwt.claim.sub', '89000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select lives_ok(
  $$select public.save_quiz(
    '{"module_id":"69000000-0000-4000-8000-000000000001","title":"Evaluación del módulo","description":"Comprueba lo aprendido","is_published":true}'::jsonb,
    '[
      {"prompt":"Pregunta 1","explanation":"Explicación 1","sort_order":0,"options":[{"option_text":"Correcta 1","is_correct":true,"sort_order":0},{"option_text":"Incorrecta 1","is_correct":false,"sort_order":1}]},
      {"prompt":"Pregunta 2","explanation":"Explicación 2","sort_order":1,"options":[{"option_text":"Correcta 2","is_correct":true,"sort_order":0},{"option_text":"Incorrecta 2","is_correct":false,"sort_order":1}]},
      {"prompt":"Pregunta 3","explanation":"Explicación 3","sort_order":2,"options":[{"option_text":"Correcta 3","is_correct":true,"sort_order":0},{"option_text":"Incorrecta 3","is_correct":false,"sort_order":1}]},
      {"prompt":"Pregunta 4","explanation":"Explicación 4","sort_order":3,"options":[{"option_text":"Correcta 4","is_correct":true,"sort_order":0},{"option_text":"Incorrecta 4","is_correct":false,"sort_order":1}]},
      {"prompt":"Pregunta 5","explanation":"Explicación 5","sort_order":4,"options":[{"option_text":"Correcta 5","is_correct":true,"sort_order":0},{"option_text":"Incorrecta 5","is_correct":false,"sort_order":1}]}
    ]'::jsonb
  )$$,
  'administrator creates and publishes a complete quiz'
);
reset role;
select set_config(
  'test.quiz_id',
  (select id::text from public.quizzes where module_id = '69000000-0000-4000-8000-000000000001'),
  true
);
select is((select count(*) from public.quizzes), 1::bigint, 'one quiz is created');
select is((select passing_score from public.quizzes), 80::smallint, 'MVP passing score is 80');
select is((select count(*) from public.quiz_questions where deleted_at is null), 5::bigint,
  'five ordered questions are created');
select is((select count(*) from public.quiz_options where deleted_at is null), 10::bigint,
  'two options per question are created');
select is((select count(*) from public.quiz_options where is_correct and deleted_at is null), 5::bigint,
  'each question has one correct option');
set local role authenticated;
select set_config('request.jwt.claim.sub', '89000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select ok(
  jsonb_path_exists(
    public.get_admin_quiz('69000000-0000-4000-8000-000000000001'),
    '$.questions[*].options[*].is_correct'
  ),
  'administrative query includes correctness'
);
select throws_ok(
  $$select public.save_quiz(
    jsonb_build_object('id', current_setting('test.quiz_id'), 'module_id', '69000000-0000-4000-8000-000000000001', 'title', 'Inválido', 'is_published', true),
    '[{"prompt":"Pregunta inválida","sort_order":0,"options":[{"option_text":"A","is_correct":false,"sort_order":0},{"option_text":"B","is_correct":false,"sort_order":1}]}]'::jsonb
  )$$,
  '22023', 'QUESTION_REQUIRES_ONE_CORRECT_OPTION',
  'quiz save requires exactly one correct option'
);
reset role;
select is((select count(*) from public.quiz_questions where deleted_at is null), 5::bigint,
  'failed validation does not replace valid questions');
select throws_ok(
  $$insert into public.quizzes (module_id, title) values ('69000000-0000-4000-8000-000000000001', 'Duplicado')$$,
  '23505', null, 'database prevents a second active quiz in the module'
);

create function pg_temp.quiz_answers(p_quiz_id uuid, p_correct_count integer)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_agg(jsonb_build_object(
    'question_id', question.id,
    'selected_option_id', selected.id
  ) order by question.sort_order)
  from public.quiz_questions question
  cross join lateral (
    select option_row.id
    from public.quiz_options option_row
    where option_row.question_id = question.id
      and option_row.deleted_at is null
      and option_row.is_correct = (question.sort_order < p_correct_count)
    limit 1
  ) selected
  where question.quiz_id = p_quiz_id
    and question.is_active
    and question.deleted_at is null;
$$;

set local role authenticated;
select set_config('request.jwt.claim.sub', '89000000-0000-4000-8000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

select ok(
  not jsonb_path_exists(
    public.get_student_quiz(
      '59000000-0000-4000-8000-000000000001',
      '69000000-0000-4000-8000-000000000001'
    ),
    '$.questions[*].options[*].is_correct'
  ),
  'student quiz payload never includes is_correct'
);
select is(
  jsonb_array_length(public.get_student_quiz(
    '59000000-0000-4000-8000-000000000001',
    '69000000-0000-4000-8000-000000000001'
  )->'questions'),
  5,
  'student receives all published questions'
);
select is(
  jsonb_array_length(public.get_student_course_quiz_summaries('59000000-0000-4000-8000-000000000001')),
  1,
  'published quiz appears in course navigation'
);
select isnt(public.check_course_completion('99000000-0000-4000-8000-000000000001'), true,
  'completed lessons are insufficient while the quiz is pending');
select ok(public.check_course_completion('99000000-0000-4000-8000-000000000002'),
  'course without quizzes only requires its mandatory lessons');

select lives_ok(
  $$select public.submit_quiz_attempt(
    '99000000-0000-4000-8000-000000000001',
    current_setting('test.quiz_id')::uuid,
    pg_temp.quiz_answers(current_setting('test.quiz_id')::uuid, 3)
  )$$,
  'student submits a first failed attempt'
);
select is((public.get_quiz_attempts(
  '99000000-0000-4000-8000-000000000001', current_setting('test.quiz_id')::uuid
)->0->>'score_percent')::numeric, 60::numeric,
  'three of five answers produce 60 percent');
select isnt((public.get_quiz_attempts(
  '99000000-0000-4000-8000-000000000001', current_setting('test.quiz_id')::uuid
)->0->>'is_passed')::boolean, true,
  '60 percent does not pass');
select is(jsonb_array_length(public.get_quiz_attempt_result(
  (public.get_quiz_attempts(
    '99000000-0000-4000-8000-000000000001', current_setting('test.quiz_id')::uuid
  )->0->>'id')::uuid
)->'answers'), 5,
  'all answer snapshots are stored atomically');
select ok(jsonb_path_exists(public.get_quiz_attempt_result(
  (public.get_quiz_attempts(
    '99000000-0000-4000-8000-000000000001', current_setting('test.quiz_id')::uuid
  )->0->>'id')::uuid
), '$.answers[*].correct_option_text'),
  'attempt answers preserve question and correct option snapshots');

select lives_ok(
  $$select public.submit_quiz_attempt(
    '99000000-0000-4000-8000-000000000001',
    current_setting('test.quiz_id')::uuid,
    pg_temp.quiz_answers(current_setting('test.quiz_id')::uuid, 4)
  )$$,
  'student submits an 80 percent attempt'
);
select is((public.get_quiz_attempts(
  '99000000-0000-4000-8000-000000000001', current_setting('test.quiz_id')::uuid
)->0->>'score_percent')::numeric, 80::numeric,
  'four of five answers produce 80 percent');
select ok((public.get_quiz_attempts(
  '99000000-0000-4000-8000-000000000001', current_setting('test.quiz_id')::uuid
)->0->>'is_passed')::boolean,
  '80 percent passes automatically');
select ok(public.check_course_completion('99000000-0000-4000-8000-000000000001'),
  'classes plus an approved quiz satisfy academic completion');

select lives_ok(
  $$select public.submit_quiz_attempt(
    '99000000-0000-4000-8000-000000000001',
    current_setting('test.quiz_id')::uuid,
    pg_temp.quiz_answers(current_setting('test.quiz_id')::uuid, 5)
  )$$,
  'student can submit an additional perfect attempt'
);
select lives_ok(
  $$select public.submit_quiz_attempt(
    '99000000-0000-4000-8000-000000000001',
    current_setting('test.quiz_id')::uuid,
    pg_temp.quiz_answers(current_setting('test.quiz_id')::uuid, 2)
  )$$,
  'student can submit a later lower attempt'
);
select is(jsonb_array_length(public.get_quiz_attempts(
  '99000000-0000-4000-8000-000000000001', current_setting('test.quiz_id')::uuid
)), 4,
  'unlimited attempts remain independent history rows');
select is((public.get_quiz_attempts(
  '99000000-0000-4000-8000-000000000001', current_setting('test.quiz_id')::uuid
)->0->>'attempt_number')::integer, 4,
  'attempt numbers are assigned coherently by PostgreSQL');
select is((public.get_quiz_attempts(
  '99000000-0000-4000-8000-000000000001', current_setting('test.quiz_id')::uuid
)->0->>'score_percent')::numeric, 40::numeric,
  'later lower attempt keeps its own score');
select ok(jsonb_path_exists(public.get_quiz_attempts(
  '99000000-0000-4000-8000-000000000001', current_setting('test.quiz_id')::uuid
), '$[*] ? (@.is_passed == true)'),
  'an earlier passing attempt remains preserved');
select ok(public.check_course_completion('99000000-0000-4000-8000-000000000001'),
  'later lower score does not regress academic approval');
select is(jsonb_array_length(public.get_quiz_attempts(
  '99000000-0000-4000-8000-000000000001',
  current_setting('test.quiz_id')::uuid
)), 4, 'student can retrieve the full attempt history');
select ok(jsonb_path_exists(
  public.get_quiz_attempt_result((public.get_quiz_attempts(
    '99000000-0000-4000-8000-000000000001', current_setting('test.quiz_id')::uuid
  )->3->>'id')::uuid),
  '$.answers[*].correct_option_text'
), 'correct answers are visible after submission');

select throws_ok(
  $$select public.submit_quiz_attempt(
    '99000000-0000-4000-8000-000000000001',
    current_setting('test.quiz_id')::uuid,
    jsonb_set(
      pg_temp.quiz_answers(current_setting('test.quiz_id')::uuid, 5),
      '{0,selected_option_id}',
      to_jsonb((select response->>'selected_option_id' from jsonb_array_elements(pg_temp.quiz_answers(current_setting('test.quiz_id')::uuid, 5)) with ordinality item(response, position) where position = 2))
    )
  )$$,
  '22023', 'OPTION_QUESTION_MISMATCH',
  'option from another question is rejected'
);
select is(jsonb_array_length(public.get_quiz_attempts(
  '99000000-0000-4000-8000-000000000001', current_setting('test.quiz_id')::uuid
)), 4,
  'invalid option creates no partial attempt');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '89000000-0000-4000-8000-000000000003', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select throws_ok(
  $$select public.get_student_quiz(
    '59000000-0000-4000-8000-000000000001',
    '69000000-0000-4000-8000-000000000001'
  )$$,
  '42501', 'ENROLLMENT_NOT_ACTIVE',
  'student without enrollment cannot retrieve the quiz'
);
select throws_ok(
  $$select public.submit_quiz_attempt(
    '99000000-0000-4000-8000-000000000001',
    current_setting('test.quiz_id')::uuid,
    '[]'::jsonb
  )$$,
  '42501', 'UNAUTHORIZED',
  'student cannot submit using another enrollment'
);

reset role;
update public.course_enrollments
set status = 'revoked', revoked_at = now()
where id = '99000000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub', '89000000-0000-4000-8000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select throws_ok(
  $$select public.submit_quiz_attempt(
    '99000000-0000-4000-8000-000000000001',
    current_setting('test.quiz_id')::uuid,
    pg_temp.quiz_answers(current_setting('test.quiz_id')::uuid, 5)
  )$$,
  'P0001', 'ENROLLMENT_NOT_ACTIVE',
  'revoked enrollment cannot submit new attempts'
);
select is(jsonb_array_length(public.get_quiz_attempts(
  '99000000-0000-4000-8000-000000000001', current_setting('test.quiz_id')::uuid
)), 4,
  'revocation preserves historical attempts');

select * from finish(true);
rollback;
