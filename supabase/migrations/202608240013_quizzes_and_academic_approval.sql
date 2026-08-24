create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.course_modules(id) on delete restrict,
  title varchar(200) not null,
  description text,
  passing_score smallint not null default 80,
  unlimited_attempts boolean not null default true,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  constraint quizzes_title_not_blank check (length(btrim(title)) > 0),
  constraint quizzes_passing_score_range check (passing_score between 0 and 100),
  constraint quizzes_deleted_by_consistency check (deleted_at is not null or deleted_by is null)
);

create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete restrict,
  prompt text not null,
  explanation text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  constraint quiz_questions_prompt_not_blank check (length(btrim(prompt)) > 0),
  constraint quiz_questions_sort_order_nonnegative check (sort_order >= 0),
  constraint quiz_questions_deleted_by_consistency check (deleted_at is not null or deleted_by is null)
);

create table public.quiz_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions(id) on delete restrict,
  option_text text not null,
  is_correct boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  constraint quiz_options_text_not_blank check (length(btrim(option_text)) > 0),
  constraint quiz_options_sort_order_nonnegative check (sort_order >= 0),
  constraint quiz_options_deleted_by_consistency check (deleted_at is not null or deleted_by is null)
);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete restrict,
  enrollment_id uuid not null references public.course_enrollments(id) on delete restrict,
  attempt_number integer not null,
  score_percent numeric(5, 2) not null,
  correct_answers integer not null,
  total_questions integer not null,
  is_passed boolean not null,
  started_at timestamptz not null default now(),
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  constraint quiz_attempts_number_positive check (attempt_number > 0),
  constraint quiz_attempts_score_range check (score_percent between 0 and 100),
  constraint quiz_attempts_answers_valid check (
    total_questions > 0 and correct_answers between 0 and total_questions
  ),
  constraint quiz_attempts_deleted_by_consistency check (deleted_at is not null or deleted_by is null)
);

create table public.quiz_attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.quiz_attempts(id) on delete restrict,
  question_id uuid not null references public.quiz_questions(id) on delete restrict,
  selected_option_id uuid not null references public.quiz_options(id) on delete restrict,
  question_text_snapshot text not null,
  selected_option_text_snapshot text not null,
  correct_option_text_snapshot text not null,
  explanation_snapshot text,
  is_correct boolean not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  constraint quiz_attempt_answers_snapshots_not_blank check (
    length(btrim(question_text_snapshot)) > 0
    and length(btrim(selected_option_text_snapshot)) > 0
    and length(btrim(correct_option_text_snapshot)) > 0
  ),
  constraint quiz_attempt_answers_deleted_by_consistency check (
    deleted_at is not null or deleted_by is null
  )
);

create unique index uq_module_quiz_active
on public.quizzes(module_id)
where deleted_at is null;

create index idx_quizzes_module_published
on public.quizzes(module_id, is_published)
where deleted_at is null;

create index idx_quiz_questions_order
on public.quiz_questions(quiz_id, sort_order)
where deleted_at is null and is_active;

create index idx_quiz_options_order
on public.quiz_options(question_id, sort_order)
where deleted_at is null;

create unique index uq_quiz_option_correct_active
on public.quiz_options(question_id)
where is_correct and deleted_at is null;

create unique index uq_quiz_attempt_number_active
on public.quiz_attempts(quiz_id, enrollment_id, attempt_number)
where deleted_at is null;

create index idx_quiz_attempts_enrollment_quiz
on public.quiz_attempts(enrollment_id, quiz_id, submitted_at desc)
where deleted_at is null;

create unique index uq_quiz_attempt_answer_active
on public.quiz_attempt_answers(attempt_id, question_id)
where deleted_at is null;

create index idx_quiz_attempt_answers_attempt
on public.quiz_attempt_answers(attempt_id)
where deleted_at is null;

create trigger set_quizzes_updated_at
before update on public.quizzes
for each row execute function public.set_updated_at();

create trigger set_quiz_questions_updated_at
before update on public.quiz_questions
for each row execute function public.set_updated_at();

create trigger set_quiz_options_updated_at
before update on public.quiz_options
for each row execute function public.set_updated_at();

create trigger set_quiz_attempts_updated_at
before update on public.quiz_attempts
for each row execute function public.set_updated_at();

create or replace function public.current_course_enrollment(p_course_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select enrollment.id
  from public.course_enrollments enrollment
  where enrollment.course_id = p_course_id
    and enrollment.person_id = public.current_person_id()
    and enrollment.status in ('active', 'completed')
    and enrollment.deleted_at is null
  limit 1;
$$;

create or replace function public.save_quiz(p_quiz jsonb, p_questions jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_quiz_id uuid := nullif(p_quiz->>'id', '')::uuid;
  v_module_id uuid := (p_quiz->>'module_id')::uuid;
  v_question jsonb;
  v_option jsonb;
  v_question_id uuid;
  v_is_published boolean := coalesce((p_quiz->>'is_published')::boolean, false);
  v_correct_count integer;
  v_option_count integer;
begin
  if not public.is_active_admin() then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;
  if jsonb_typeof(p_questions) <> 'array' then
    raise exception 'INVALID_QUESTIONS' using errcode = '22023';
  end if;
  if length(btrim(coalesce(p_quiz->>'title', ''))) < 3 then
    raise exception 'QUIZ_TITLE_REQUIRED' using errcode = '22023';
  end if;
  if not exists (
    select 1
    from public.course_modules module
    join public.courses course on course.id = module.course_id
    where module.id = v_module_id
      and module.deleted_at is null
      and course.deleted_at is null
  ) then
    raise exception 'MODULE_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_is_published and jsonb_array_length(p_questions) = 0 then
    raise exception 'PUBLISHED_QUIZ_REQUIRES_QUESTIONS' using errcode = '22023';
  end if;

  for v_question in select value from jsonb_array_elements(p_questions)
  loop
    if length(btrim(coalesce(v_question->>'prompt', ''))) < 3 then
      raise exception 'QUESTION_PROMPT_REQUIRED' using errcode = '22023';
    end if;
    if jsonb_typeof(v_question->'options') <> 'array' then
      raise exception 'INVALID_QUESTION_OPTIONS' using errcode = '22023';
    end if;
    v_option_count := jsonb_array_length(v_question->'options');
    select count(*) into v_correct_count
    from jsonb_array_elements(v_question->'options') option_item
    where coalesce((option_item->>'is_correct')::boolean, false);
    if v_option_count < 2 then
      raise exception 'QUESTION_REQUIRES_TWO_OPTIONS' using errcode = '22023';
    end if;
    if v_correct_count <> 1 then
      raise exception 'QUESTION_REQUIRES_ONE_CORRECT_OPTION' using errcode = '22023';
    end if;
    if exists (
      select 1 from jsonb_array_elements(v_question->'options') option_item
      where length(btrim(coalesce(option_item->>'option_text', ''))) = 0
    ) then
      raise exception 'OPTION_TEXT_REQUIRED' using errcode = '22023';
    end if;
  end loop;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_module_id::text, 0));

  if v_quiz_id is null then
    insert into public.quizzes (
      module_id, title, description, passing_score, unlimited_attempts, is_published
    ) values (
      v_module_id, btrim(p_quiz->>'title'), nullif(btrim(p_quiz->>'description'), ''),
      80, true, v_is_published
    ) returning id into v_quiz_id;
  else
    update public.quizzes
    set title = btrim(p_quiz->>'title'),
        description = nullif(btrim(p_quiz->>'description'), ''),
        passing_score = 80,
        unlimited_attempts = true,
        is_published = v_is_published
    where id = v_quiz_id
      and module_id = v_module_id
      and deleted_at is null;
    if not found then
      raise exception 'QUIZ_NOT_FOUND' using errcode = 'P0001';
    end if;

    update public.quiz_options option_row
    set deleted_at = now(), deleted_by = auth.uid()
    from public.quiz_questions question
    where question.quiz_id = v_quiz_id
      and option_row.question_id = question.id
      and option_row.deleted_at is null;

    update public.quiz_questions
    set deleted_at = now(), deleted_by = auth.uid(), is_active = false
    where quiz_id = v_quiz_id and deleted_at is null;
  end if;

  for v_question in select value from jsonb_array_elements(p_questions)
  loop
    insert into public.quiz_questions (
      quiz_id, prompt, explanation, sort_order, is_active
    ) values (
      v_quiz_id, btrim(v_question->>'prompt'),
      nullif(btrim(v_question->>'explanation'), ''),
      coalesce((v_question->>'sort_order')::integer, 0), true
    ) returning id into v_question_id;

    for v_option in select value from jsonb_array_elements(v_question->'options')
    loop
      insert into public.quiz_options (
        question_id, option_text, is_correct, sort_order
      ) values (
        v_question_id, btrim(v_option->>'option_text'),
        coalesce((v_option->>'is_correct')::boolean, false),
        coalesce((v_option->>'sort_order')::integer, 0)
      );
    end loop;
  end loop;

  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, new_data)
  values (
    auth.uid(), 'quiz_saved', 'quiz', v_quiz_id,
    jsonb_build_object(
      'module_id', v_module_id,
      'is_published', v_is_published,
      'question_count', jsonb_array_length(p_questions)
    )
  );

  return v_quiz_id;
end;
$$;

create or replace function public.get_admin_quiz(p_module_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if not public.is_active_admin() then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'id', quiz.id,
    'module_id', quiz.module_id,
    'title', quiz.title,
    'description', quiz.description,
    'passing_score', quiz.passing_score,
    'is_published', quiz.is_published,
    'questions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', question.id,
        'prompt', question.prompt,
        'explanation', question.explanation,
        'sort_order', question.sort_order,
        'options', coalesce((
          select jsonb_agg(jsonb_build_object(
            'id', option_row.id,
            'option_text', option_row.option_text,
            'is_correct', option_row.is_correct,
            'sort_order', option_row.sort_order
          ) order by option_row.sort_order, option_row.id)
          from public.quiz_options option_row
          where option_row.question_id = question.id and option_row.deleted_at is null
        ), '[]'::jsonb)
      ) order by question.sort_order, question.id)
      from public.quiz_questions question
      where question.quiz_id = quiz.id
        and question.is_active
        and question.deleted_at is null
    ), '[]'::jsonb)
  ) into v_result
  from public.quizzes quiz
  where quiz.module_id = p_module_id and quiz.deleted_at is null;

  return v_result;
end;
$$;

create or replace function public.get_student_course_quiz_summaries(p_course_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_enrollment_id uuid := public.current_course_enrollment(p_course_id);
  v_result jsonb;
begin
  if v_enrollment_id is null then
    raise exception 'ENROLLMENT_NOT_ACTIVE' using errcode = '42501';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', quiz.id,
    'module_id', quiz.module_id,
    'title', quiz.title,
    'passing_score', quiz.passing_score,
    'attempt_count', (
      select count(*) from public.quiz_attempts attempt
      where attempt.quiz_id = quiz.id
        and attempt.enrollment_id = v_enrollment_id
        and attempt.deleted_at is null
    ),
    'best_score', (
      select max(attempt.score_percent) from public.quiz_attempts attempt
      where attempt.quiz_id = quiz.id
        and attempt.enrollment_id = v_enrollment_id
        and attempt.deleted_at is null
    ),
    'is_passed', exists (
      select 1 from public.quiz_attempts attempt
      where attempt.quiz_id = quiz.id
        and attempt.enrollment_id = v_enrollment_id
        and attempt.is_passed
        and attempt.deleted_at is null
    )
  ) order by module.sort_order, quiz.id), '[]'::jsonb) into v_result
  from public.quizzes quiz
  join public.course_modules module on module.id = quiz.module_id
  join public.courses course on course.id = module.course_id
  where module.course_id = p_course_id
    and module.is_published
    and module.deleted_at is null
    and quiz.is_published
    and quiz.deleted_at is null
    and course.status = 'published'
    and course.published_at is not null
    and course.deleted_at is null;

  return v_result;
end;
$$;

create or replace function public.get_student_quiz(p_course_id uuid, p_module_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_enrollment_id uuid := public.current_course_enrollment(p_course_id);
  v_result jsonb;
begin
  if v_enrollment_id is null then
    raise exception 'ENROLLMENT_NOT_ACTIVE' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'id', quiz.id,
    'module_id', quiz.module_id,
    'title', quiz.title,
    'description', quiz.description,
    'passing_score', quiz.passing_score,
    'enrollment_id', v_enrollment_id,
    'questions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', question.id,
        'prompt', question.prompt,
        'sort_order', question.sort_order,
        'options', coalesce((
          select jsonb_agg(jsonb_build_object(
            'id', option_row.id,
            'option_text', option_row.option_text,
            'sort_order', option_row.sort_order
          ) order by option_row.sort_order, option_row.id)
          from public.quiz_options option_row
          where option_row.question_id = question.id and option_row.deleted_at is null
        ), '[]'::jsonb)
      ) order by question.sort_order, question.id)
      from public.quiz_questions question
      where question.quiz_id = quiz.id
        and question.is_active
        and question.deleted_at is null
    ), '[]'::jsonb)
  ) into v_result
  from public.quizzes quiz
  join public.course_modules module on module.id = quiz.module_id
  join public.courses course on course.id = module.course_id
  where quiz.module_id = p_module_id
    and module.course_id = p_course_id
    and quiz.is_published
    and quiz.deleted_at is null
    and module.is_published
    and module.deleted_at is null
    and course.status = 'published'
    and course.published_at is not null
    and course.deleted_at is null;

  return v_result;
end;
$$;

create or replace function public.get_quiz_attempts(p_enrollment_id uuid, p_quiz_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if not exists (
    select 1 from public.course_enrollments enrollment
    where enrollment.id = p_enrollment_id
      and enrollment.person_id = public.current_person_id()
      and enrollment.deleted_at is null
  ) then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', attempt.id,
    'attempt_number', attempt.attempt_number,
    'score_percent', attempt.score_percent,
    'correct_answers', attempt.correct_answers,
    'total_questions', attempt.total_questions,
    'is_passed', attempt.is_passed,
    'submitted_at', attempt.submitted_at
  ) order by attempt.attempt_number desc), '[]'::jsonb) into v_result
  from public.quiz_attempts attempt
  where attempt.enrollment_id = p_enrollment_id
    and attempt.quiz_id = p_quiz_id
    and attempt.deleted_at is null;

  return v_result;
end;
$$;

create or replace function public.get_quiz_attempt_result(p_attempt_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  select jsonb_build_object(
    'id', attempt.id,
    'quiz_id', attempt.quiz_id,
    'enrollment_id', attempt.enrollment_id,
    'attempt_number', attempt.attempt_number,
    'score_percent', attempt.score_percent,
    'correct_answers', attempt.correct_answers,
    'total_questions', attempt.total_questions,
    'is_passed', attempt.is_passed,
    'submitted_at', attempt.submitted_at,
    'answers', coalesce((
      select jsonb_agg(jsonb_build_object(
        'question_id', answer.question_id,
        'selected_option_id', answer.selected_option_id,
        'question_text', answer.question_text_snapshot,
        'selected_option_text', answer.selected_option_text_snapshot,
        'correct_option_text', answer.correct_option_text_snapshot,
        'explanation', answer.explanation_snapshot,
        'is_correct', answer.is_correct
      ) order by answer.created_at, answer.id)
      from public.quiz_attempt_answers answer
      where answer.attempt_id = attempt.id and answer.deleted_at is null
    ), '[]'::jsonb)
  ) into v_result
  from public.quiz_attempts attempt
  join public.course_enrollments enrollment on enrollment.id = attempt.enrollment_id
  where attempt.id = p_attempt_id
    and attempt.deleted_at is null
    and enrollment.person_id = public.current_person_id()
    and enrollment.deleted_at is null;

  if v_result is null then
    raise exception 'ATTEMPT_NOT_FOUND' using errcode = 'P0001';
  end if;
  return v_result;
end;
$$;

create or replace function public.check_course_completion(p_enrollment_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_enrollment public.course_enrollments%rowtype;
  v_required_count integer;
  v_pending_lesson_count integer;
  v_pending_quiz_count integer;
begin
  select * into v_enrollment
  from public.course_enrollments
  where id = p_enrollment_id and deleted_at is null;

  if not found then
    raise exception 'ENROLLMENT_NOT_FOUND' using errcode = 'P0001';
  end if;
  if auth.role() <> 'service_role'
    and v_enrollment.person_id is distinct from public.current_person_id()
    and not public.is_active_admin() then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;

  select count(*), count(*) filter (where coalesce(progress.is_completed, false) = false)
  into v_required_count, v_pending_lesson_count
  from public.lessons lesson
  join public.course_modules module on module.id = lesson.module_id
  left join public.lesson_progress progress
    on progress.enrollment_id = p_enrollment_id
    and progress.lesson_id = lesson.id
    and progress.deleted_at is null
  where module.course_id = v_enrollment.course_id
    and module.is_published
    and module.deleted_at is null
    and lesson.is_required
    and lesson.is_published
    and lesson.deleted_at is null;

  select count(*) into v_pending_quiz_count
  from public.quizzes quiz
  join public.course_modules module on module.id = quiz.module_id
  where module.course_id = v_enrollment.course_id
    and module.is_published
    and module.deleted_at is null
    and quiz.is_published
    and quiz.deleted_at is null
    and not exists (
      select 1 from public.quiz_attempts attempt
      where attempt.quiz_id = quiz.id
        and attempt.enrollment_id = p_enrollment_id
        and attempt.is_passed
        and attempt.deleted_at is null
    );

  return v_required_count > 0
    and v_pending_lesson_count = 0
    and v_pending_quiz_count = 0;
end;
$$;

create or replace function public.submit_quiz_attempt(
  p_enrollment_id uuid,
  p_quiz_id uuid,
  p_answers jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_enrollment public.course_enrollments%rowtype;
  v_quiz public.quizzes%rowtype;
  v_question public.quiz_questions%rowtype;
  v_selected_option public.quiz_options%rowtype;
  v_correct_option public.quiz_options%rowtype;
  v_response jsonb;
  v_attempt_id uuid;
  v_attempt_number integer;
  v_course_id uuid;
  v_question_count integer;
  v_correct_answers integer := 0;
  v_score numeric(5, 2);
  v_is_passed boolean;
  v_completion_ready boolean;
begin
  if jsonb_typeof(p_answers) <> 'array' then
    raise exception 'INVALID_ANSWERS' using errcode = '22023';
  end if;

  select * into v_enrollment
  from public.course_enrollments
  where id = p_enrollment_id and deleted_at is null;
  if not found then raise exception 'ENROLLMENT_NOT_FOUND' using errcode = 'P0001'; end if;
  if v_enrollment.person_id is distinct from public.current_person_id() then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;
  if v_enrollment.status not in ('active', 'completed') then
    raise exception 'ENROLLMENT_NOT_ACTIVE' using errcode = 'P0001';
  end if;

  select quiz.* into v_quiz
  from public.quizzes quiz
  join public.course_modules module on module.id = quiz.module_id
  join public.courses course on course.id = module.course_id
  where quiz.id = p_quiz_id
    and quiz.is_published
    and quiz.deleted_at is null
    and module.is_published
    and module.deleted_at is null
    and course.status = 'published'
    and course.published_at is not null
    and course.deleted_at is null;
  if not found then raise exception 'QUIZ_NOT_AVAILABLE' using errcode = 'P0001'; end if;
  select module.course_id into v_course_id
  from public.course_modules module
  where module.id = v_quiz.module_id;
  if v_course_id <> v_enrollment.course_id then
    raise exception 'QUIZ_ENROLLMENT_MISMATCH' using errcode = 'P0001';
  end if;

  select count(*) into v_question_count
  from public.quiz_questions
  where quiz_id = p_quiz_id and is_active and deleted_at is null;
  if v_question_count = 0 then raise exception 'QUIZ_HAS_NO_QUESTIONS' using errcode = 'P0001'; end if;
  if jsonb_array_length(p_answers) <> v_question_count then
    raise exception 'ALL_QUESTIONS_REQUIRED' using errcode = '22023';
  end if;
  if (
    select count(distinct response->>'question_id')
    from jsonb_array_elements(p_answers) response
  ) <> v_question_count then
    raise exception 'DUPLICATE_OR_MISSING_ANSWERS' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_enrollment_id::text || ':' || p_quiz_id::text, 0)
  );
  select coalesce(max(attempt_number), 0) + 1 into v_attempt_number
  from public.quiz_attempts
  where enrollment_id = p_enrollment_id and quiz_id = p_quiz_id and deleted_at is null;

  for v_question in
    select * from public.quiz_questions
    where quiz_id = p_quiz_id and is_active and deleted_at is null
    order by sort_order, id
  loop
    select response into v_response
    from jsonb_array_elements(p_answers) response
    where response->>'question_id' = v_question.id::text;
    if v_response is null then
      raise exception 'QUESTION_ANSWER_REQUIRED' using errcode = '22023';
    end if;

    select * into v_selected_option
    from public.quiz_options
    where id = (v_response->>'selected_option_id')::uuid
      and question_id = v_question.id
      and deleted_at is null;
    if not found then
      raise exception 'OPTION_QUESTION_MISMATCH' using errcode = '22023';
    end if;

    select * into v_correct_option
    from public.quiz_options
    where question_id = v_question.id and is_correct and deleted_at is null;
    if not found then
      raise exception 'QUESTION_CORRECT_OPTION_MISSING' using errcode = 'P0001';
    end if;
    if v_selected_option.id = v_correct_option.id then
      v_correct_answers := v_correct_answers + 1;
    end if;
  end loop;

  v_score := round((v_correct_answers::numeric / v_question_count::numeric) * 100, 2);
  v_is_passed := v_score >= v_quiz.passing_score;

  insert into public.quiz_attempts (
    quiz_id, enrollment_id, attempt_number, score_percent, correct_answers,
    total_questions, is_passed, started_at, submitted_at
  ) values (
    p_quiz_id, p_enrollment_id, v_attempt_number, v_score, v_correct_answers,
    v_question_count, v_is_passed, now(), now()
  ) returning id into v_attempt_id;

  for v_question in
    select * from public.quiz_questions
    where quiz_id = p_quiz_id and is_active and deleted_at is null
    order by sort_order, id
  loop
    select response into v_response
    from jsonb_array_elements(p_answers) response
    where response->>'question_id' = v_question.id::text;
    select * into v_selected_option
    from public.quiz_options
    where id = (v_response->>'selected_option_id')::uuid;
    select * into v_correct_option
    from public.quiz_options
    where question_id = v_question.id and is_correct and deleted_at is null;

    insert into public.quiz_attempt_answers (
      attempt_id, question_id, selected_option_id, question_text_snapshot,
      selected_option_text_snapshot, correct_option_text_snapshot,
      explanation_snapshot, is_correct
    ) values (
      v_attempt_id, v_question.id, v_selected_option.id, v_question.prompt,
      v_selected_option.option_text, v_correct_option.option_text,
      v_question.explanation, v_selected_option.id = v_correct_option.id
    );
  end loop;

  v_completion_ready := public.check_course_completion(p_enrollment_id);
  return public.get_quiz_attempt_result(v_attempt_id) || jsonb_build_object(
    'course_completion_ready', v_completion_ready
  );
end;
$$;

alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_options enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_attempt_answers enable row level security;

revoke all on table public.quizzes, public.quiz_questions, public.quiz_options,
  public.quiz_attempts, public.quiz_attempt_answers from anon, authenticated;
grant all on table public.quizzes, public.quiz_questions, public.quiz_options,
  public.quiz_attempts, public.quiz_attempt_answers to service_role;

revoke execute on function public.current_course_enrollment(uuid) from public, anon, authenticated;
revoke execute on function public.save_quiz(jsonb, jsonb) from public, anon;
revoke execute on function public.get_admin_quiz(uuid) from public, anon;
revoke execute on function public.get_student_course_quiz_summaries(uuid) from public, anon;
revoke execute on function public.get_student_quiz(uuid, uuid) from public, anon;
revoke execute on function public.get_quiz_attempts(uuid, uuid) from public, anon;
revoke execute on function public.get_quiz_attempt_result(uuid) from public, anon;
revoke execute on function public.submit_quiz_attempt(uuid, uuid, jsonb) from public, anon;

grant execute on function public.current_course_enrollment(uuid) to service_role;
grant execute on function public.save_quiz(jsonb, jsonb) to authenticated, service_role;
grant execute on function public.get_admin_quiz(uuid) to authenticated, service_role;
grant execute on function public.get_student_course_quiz_summaries(uuid) to authenticated, service_role;
grant execute on function public.get_student_quiz(uuid, uuid) to authenticated, service_role;
grant execute on function public.get_quiz_attempts(uuid, uuid) to authenticated, service_role;
grant execute on function public.get_quiz_attempt_result(uuid) to authenticated, service_role;
grant execute on function public.submit_quiz_attempt(uuid, uuid, jsonb) to authenticated, service_role;

comment on table public.quizzes is 'Evaluación opcional y única por módulo del Campus.';
comment on table public.quiz_attempts is 'Historial inmutable de calificaciones por matrícula y quiz.';
comment on function public.get_student_quiz(uuid, uuid) is
  'Entrega preguntas y alternativas sin exponer is_correct.';
comment on function public.submit_quiz_attempt(uuid, uuid, jsonb) is
  'Corrige de forma atómica, conserva snapshots y comprueba cumplimiento académico.';
