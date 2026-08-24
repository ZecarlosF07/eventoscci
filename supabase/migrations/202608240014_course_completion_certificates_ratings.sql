alter table public.certificates
  add constraint certificates_course_enrollment_id_fkey
  foreign key (course_enrollment_id)
  references public.course_enrollments(id)
  on delete restrict;

create unique index uq_certificates_course_enrollment_active
on public.certificates(course_enrollment_id)
where certificate_type = 'course' and deleted_at is null;

create table public.course_ratings (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete restrict,
  person_id uuid not null references public.people(id) on delete restrict,
  enrollment_id uuid not null references public.course_enrollments(id) on delete restrict,
  rating smallint not null,
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  constraint course_ratings_value_range check (rating between 1 and 5),
  constraint course_ratings_comment_length check (comment is null or length(comment) <= 2000),
  constraint course_ratings_deleted_by_consistency check (deleted_at is not null or deleted_by is null)
);

create unique index uq_course_rating_active
on public.course_ratings(course_id, person_id)
where deleted_at is null;

create index idx_course_ratings_enrollment
on public.course_ratings(enrollment_id)
where deleted_at is null;

create trigger set_course_ratings_updated_at
before update on public.course_ratings
for each row execute function public.set_updated_at();

alter table public.course_ratings enable row level security;
revoke all on table public.course_ratings from anon, authenticated;
grant all on table public.course_ratings to service_role;

insert into public.certificate_templates (
  id, name, scope, template_config, is_default, is_active
)
select
  'c5000000-0000-4000-8000-000000000002',
  'Modelo institucional CCI para cursos',
  'course',
  '{"bundled_background":"cci-activity-certificate-background.png","show_date":false,"portrait":true}'::jsonb,
  true,
  true
where not exists (
  select 1 from public.certificate_templates
  where scope = 'course' and is_active and deleted_at is null
);

insert into public.certificate_template_signers (
  id, template_id, signer_name, signer_title, sort_order
)
select
  'c5100000-0000-4000-8000-000000000002',
  'c5000000-0000-4000-8000-000000000002',
  'Eduardo Ojeda Davila',
  'Presidente Institucional',
  0
where exists (
  select 1 from public.certificate_templates
  where id = 'c5000000-0000-4000-8000-000000000002'
)
and not exists (
  select 1 from public.certificate_template_signers
  where id = 'c5100000-0000-4000-8000-000000000002'
);

create or replace function public.check_course_completion(p_enrollment_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_certificate_id uuid;
  v_course public.courses%rowtype;
  v_enrollment public.course_enrollments%rowtype;
  v_pending_lesson_count integer;
  v_pending_quiz_count integer;
  v_required_count integer;
  v_template_id uuid;
  v_was_completed boolean;
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('course-completion:' || p_enrollment_id::text, 0)
  );

  select enrollment.* into v_enrollment
  from public.course_enrollments enrollment
  join public.people person on person.id = enrollment.person_id and person.deleted_at is null
  join public.courses course on course.id = enrollment.course_id and course.deleted_at is null
  where enrollment.id = p_enrollment_id and enrollment.deleted_at is null
  for update of enrollment;

  if not found then
    raise exception 'ENROLLMENT_NOT_FOUND' using errcode = 'P0001';
  end if;
  if auth.role() <> 'service_role'
    and v_enrollment.person_id is distinct from public.current_person_id()
    and not public.is_active_admin() then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;
  if v_enrollment.status = 'revoked' then return false; end if;
  if v_enrollment.status not in ('active', 'completed') then return false; end if;

  select count(*), count(*) filter (where coalesce(progress.is_completed, false) = false)
  into v_required_count, v_pending_lesson_count
  from public.lessons lesson
  join public.course_modules module on module.id = lesson.module_id
  left join public.lesson_progress progress
    on progress.enrollment_id = p_enrollment_id
    and progress.lesson_id = lesson.id
    and progress.deleted_at is null
  where module.course_id = v_enrollment.course_id
    and module.is_published and module.deleted_at is null
    and lesson.is_required and lesson.is_published and lesson.deleted_at is null;

  select count(*) into v_pending_quiz_count
  from public.quizzes quiz
  join public.course_modules module on module.id = quiz.module_id
  where module.course_id = v_enrollment.course_id
    and module.is_published and module.deleted_at is null
    and quiz.is_published and quiz.deleted_at is null
    and not exists (
      select 1 from public.quiz_attempts attempt
      where attempt.quiz_id = quiz.id
        and attempt.enrollment_id = p_enrollment_id
        and attempt.is_passed and attempt.deleted_at is null
    );

  if v_required_count = 0 or v_pending_lesson_count > 0 or v_pending_quiz_count > 0 then
    return false;
  end if;

  v_was_completed := v_enrollment.status = 'completed';
  update public.course_enrollments
  set status = 'completed',
      completed_at = coalesce(completed_at, now()),
      progress_percent = 100
  where id = p_enrollment_id
  returning * into v_enrollment;

  select * into v_course from public.courses where id = v_enrollment.course_id;
  select template.id into v_template_id
  from public.certificate_templates template
  where template.scope = 'course' and template.is_active and template.deleted_at is null
  order by template.is_default desc, template.created_at, template.id
  limit 1;

  if v_template_id is not null then
    insert into public.certificates (
      person_id, template_id, course_enrollment_id, certificate_type,
      certificate_code, participant_name_snapshot, title_snapshot,
      condition_snapshot, date_text_snapshot, academic_hours_snapshot, issued_by
    )
    select
      v_enrollment.person_id,
      v_template_id,
      v_enrollment.id,
      'course',
      concat('CCI-CUR-', extract(year from now())::integer, '-', lpad(nextval('public.certificate_code_seq'::regclass)::text, 6, '0')),
      concat_ws(' ', person.first_names, person.last_names),
      v_course.title,
      'Aprobó',
      null,
      v_course.academic_hours,
      null
    from public.people person
    where person.id = v_enrollment.person_id
    on conflict (course_enrollment_id)
      where certificate_type = 'course' and deleted_at is null
      do nothing
    returning id into v_certificate_id;
  end if;

  if not v_was_completed then
    insert into public.audit_logs (action, entity_type, entity_id, new_data)
    values (
      'course.completed', 'course_enrollment', v_enrollment.id,
      jsonb_build_object(
        'course_id', v_enrollment.course_id,
        'completed_at', v_enrollment.completed_at,
        'certificate_id', v_certificate_id
      )
    );
  end if;
  return true;
end;
$$;

create or replace function public.update_lesson_progress(
  p_enrollment_id uuid,
  p_lesson_id uuid,
  p_last_position_seconds integer,
  p_watched_seconds integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_enrollment public.course_enrollments%rowtype;
  v_lesson public.lessons%rowtype;
  v_progress public.lesson_progress%rowtype;
  v_course_id uuid;
  v_recognized_watched integer;
  v_progress_percent numeric(5, 2);
  v_course_progress numeric(5, 2);
  v_is_completed boolean;
  v_was_completed boolean;
  v_completion_ready boolean := false;
  v_max_increment constant integer := 30;
begin
  if p_last_position_seconds is null or p_last_position_seconds < 0
    or p_watched_seconds is null or p_watched_seconds < 0 then
    raise exception 'INVALID_PROGRESS_VALUES' using errcode = '22023';
  end if;
  select * into v_enrollment from public.course_enrollments
  where id = p_enrollment_id and deleted_at is null for update;
  if not found then raise exception 'ENROLLMENT_NOT_FOUND' using errcode = 'P0001'; end if;
  if v_enrollment.person_id is distinct from public.current_person_id() then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;
  if v_enrollment.status not in ('active', 'completed') then
    raise exception 'ENROLLMENT_NOT_ACTIVE' using errcode = 'P0001';
  end if;

  select lesson.* into v_lesson
  from public.lessons lesson
  join public.course_modules module on module.id = lesson.module_id
  join public.courses course on course.id = module.course_id
  where lesson.id = p_lesson_id and lesson.deleted_at is null and lesson.is_published
    and module.deleted_at is null and module.is_published
    and course.deleted_at is null and course.status = 'published' and course.published_at is not null;
  if not found then raise exception 'LESSON_NOT_AVAILABLE' using errcode = 'P0001'; end if;
  select course_id into v_course_id from public.course_modules where id = v_lesson.module_id;
  if v_course_id <> v_enrollment.course_id then
    raise exception 'LESSON_ENROLLMENT_MISMATCH' using errcode = 'P0001';
  end if;
  if v_lesson.duration_seconds is null or v_lesson.duration_seconds <= 0 then
    raise exception 'LESSON_DURATION_REQUIRED' using errcode = 'P0001';
  end if;
  if p_last_position_seconds > v_lesson.duration_seconds then
    raise exception 'POSITION_EXCEEDS_DURATION' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_enrollment_id::text || ':' || p_lesson_id::text, 0)
  );
  select * into v_progress from public.lesson_progress
  where enrollment_id = p_enrollment_id and lesson_id = p_lesson_id and deleted_at is null
  for update;
  v_was_completed := coalesce(v_progress.is_completed, false);
  v_recognized_watched := least(
    v_lesson.duration_seconds,
    case
      when v_progress.id is null then least(p_watched_seconds, v_max_increment)
      when p_watched_seconds <= v_progress.watched_seconds then v_progress.watched_seconds
      else v_progress.watched_seconds + least(p_watched_seconds - v_progress.watched_seconds, v_max_increment)
    end
  );
  v_progress_percent := round((v_recognized_watched::numeric / v_lesson.duration_seconds::numeric) * 100, 2);
  v_is_completed := v_was_completed or v_progress_percent >= 90;

  if v_progress.id is null then
    insert into public.lesson_progress (
      enrollment_id, lesson_id, last_position_seconds, watched_seconds,
      duration_seconds_snapshot, progress_percent, is_completed, completed_at, last_watched_at
    ) values (
      p_enrollment_id, p_lesson_id, p_last_position_seconds, v_recognized_watched,
      v_lesson.duration_seconds, v_progress_percent, v_is_completed,
      case when v_is_completed then now() else null end, now()
    ) returning * into v_progress;
  else
    update public.lesson_progress
    set last_position_seconds = p_last_position_seconds,
        watched_seconds = v_recognized_watched,
        duration_seconds_snapshot = v_lesson.duration_seconds,
        progress_percent = greatest(progress_percent, v_progress_percent),
        is_completed = v_is_completed,
        completed_at = case when v_is_completed then coalesce(completed_at, now()) else null end,
        last_watched_at = now()
    where id = v_progress.id returning * into v_progress;
  end if;

  v_course_progress := public.recalculate_course_progress(p_enrollment_id);
  if v_is_completed and not v_was_completed then
    v_completion_ready := public.check_course_completion(p_enrollment_id);
  elsif v_enrollment.status = 'completed' then
    v_completion_ready := true;
  end if;
  if v_completion_ready then v_course_progress := 100; end if;

  return to_jsonb(v_progress) || jsonb_build_object(
    'course_progress_percent', v_course_progress,
    'course_completion_ready', v_completion_ready
  );
end;
$$;

create or replace function public.get_my_certificates()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_person_id uuid := public.current_person_id();
  v_result jsonb;
begin
  if v_person_id is null then raise exception 'ACCOUNT_NOT_LINKED' using errcode = '42501'; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', certificate.id,
    'access_token', certificate.access_token,
    'certificate_code', certificate.certificate_code,
    'certificate_type', certificate.certificate_type,
    'status', certificate.status,
    'title', certificate.title_snapshot,
    'condition', certificate.condition_snapshot,
    'academic_hours', certificate.academic_hours_snapshot,
    'issued_at', certificate.issued_at,
    'file_ready', certificate.file_path is not null,
    'revocation_reason', certificate.revocation_reason,
    'course_id', enrollment.course_id
  ) order by certificate.issued_at desc), '[]'::jsonb) into v_result
  from public.certificates certificate
  left join public.course_enrollments enrollment on enrollment.id = certificate.course_enrollment_id
  where certificate.person_id = v_person_id and certificate.deleted_at is null;
  return v_result;
end;
$$;

create or replace function public.get_my_course_certificate(p_course_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', certificate.id,
    'access_token', certificate.access_token,
    'certificate_code', certificate.certificate_code,
    'certificate_type', certificate.certificate_type,
    'status', certificate.status,
    'title', certificate.title_snapshot,
    'condition', certificate.condition_snapshot,
    'academic_hours', certificate.academic_hours_snapshot,
    'issued_at', certificate.issued_at,
    'file_ready', certificate.file_path is not null,
    'revocation_reason', certificate.revocation_reason,
    'course_id', enrollment.course_id
  )
  from public.certificates certificate
  join public.course_enrollments enrollment on enrollment.id = certificate.course_enrollment_id
  where enrollment.course_id = p_course_id
    and enrollment.person_id = public.current_person_id()
    and enrollment.deleted_at is null
    and certificate.certificate_type = 'course'
    and certificate.deleted_at is null
  limit 1;
$$;

create or replace function public.authorize_course_certificate_generation(p_certificate_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.certificates certificate
    join public.course_enrollments enrollment on enrollment.id = certificate.course_enrollment_id
    where certificate.id = p_certificate_id
      and certificate.certificate_type = 'course'
      and certificate.status = 'issued'
      and certificate.deleted_at is null
      and enrollment.person_id = public.current_person_id()
      and enrollment.status = 'completed'
      and enrollment.deleted_at is null
  );
$$;

create or replace function public.finalize_course_certificate(
  p_certificate_id uuid,
  p_file_path text,
  p_public_base_url text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_certificate public.certificates%rowtype;
  v_email text;
begin
  if auth.role() <> 'service_role' then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  if length(btrim(p_file_path)) < 5 or length(btrim(p_public_base_url)) < 8 then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;
  select * into v_certificate from public.certificates
  where id = p_certificate_id and certificate_type = 'course' and deleted_at is null for update;
  if not found then raise exception 'CERTIFICATE_NOT_FOUND' using errcode = 'P0001'; end if;
  if v_certificate.status = 'revoked' then raise exception 'CERTIFICATE_REVOKED' using errcode = 'P0001'; end if;
  if v_certificate.file_path is not null then
    return jsonb_build_object('changed', false, 'certificate_id', v_certificate.id);
  end if;

  update public.certificates set file_path = btrim(p_file_path)
  where id = v_certificate.id returning * into v_certificate;
  select email into strict v_email from public.people where id = v_certificate.person_id;
  insert into public.notification_outbox (
    person_id, event_type, recipient_email, related_entity_type, related_entity_id, payload
  ) values (
    v_certificate.person_id,
    'course_certificate_issued',
    v_email,
    'certificate',
    v_certificate.id,
    jsonb_build_object(
      'certificate_code', v_certificate.certificate_code,
      'certificate_url', concat(rtrim(p_public_base_url, '/'), '/certificados/', v_certificate.access_token),
      'participant_name', v_certificate.participant_name_snapshot,
      'course_title', v_certificate.title_snapshot,
      'condition', v_certificate.condition_snapshot
    )
  ) on conflict (event_type, related_entity_type, related_entity_id)
    where deleted_at is null and related_entity_id is not null do nothing;
  return jsonb_build_object('changed', true, 'certificate_id', v_certificate.id);
end;
$$;

create or replace function public.get_my_course_rating(p_course_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', rating.id,
    'course_id', rating.course_id,
    'enrollment_id', rating.enrollment_id,
    'rating', rating.rating,
    'comment', rating.comment,
    'created_at', rating.created_at,
    'updated_at', rating.updated_at
  )
  from public.course_ratings rating
  where rating.course_id = p_course_id
    and rating.person_id = public.current_person_id()
    and rating.deleted_at is null
  limit 1;
$$;

create or replace function public.save_course_rating(
  p_course_id uuid,
  p_rating smallint,
  p_comment text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_enrollment_id uuid;
  v_id uuid;
  v_person_id uuid := public.current_person_id();
begin
  if v_person_id is null then raise exception 'ACCOUNT_NOT_LINKED' using errcode = '42501'; end if;
  if p_rating < 1 or p_rating > 5 or length(coalesce(p_comment, '')) > 2000 then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;
  select enrollment.id into v_enrollment_id
  from public.course_enrollments enrollment
  where enrollment.course_id = p_course_id
    and enrollment.person_id = v_person_id
    and enrollment.status = 'completed'
    and enrollment.deleted_at is null
  order by enrollment.completed_at desc nulls last
  limit 1;
  if v_enrollment_id is null then
    raise exception 'COURSE_NOT_COMPLETED' using errcode = '42501';
  end if;

  select id into v_id from public.course_ratings
  where course_id = p_course_id and person_id = v_person_id and deleted_at is null
  for update;
  if v_id is null then
    insert into public.course_ratings (course_id, person_id, enrollment_id, rating, comment)
    values (p_course_id, v_person_id, v_enrollment_id, p_rating, nullif(btrim(p_comment), ''))
    returning id into v_id;
  else
    update public.course_ratings
    set rating = p_rating, comment = nullif(btrim(p_comment), ''), enrollment_id = v_enrollment_id
    where id = v_id;
  end if;
  return v_id;
end;
$$;

create or replace function public.delete_course_rating(p_course_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.course_ratings
  set deleted_at = now(), deleted_by = auth.uid()
  where course_id = p_course_id
    and person_id = public.current_person_id()
    and deleted_at is null;
  return found;
end;
$$;

revoke execute on function public.get_my_certificates() from public, anon;
revoke execute on function public.get_my_course_certificate(uuid) from public, anon;
revoke execute on function public.authorize_course_certificate_generation(uuid) from public, anon;
revoke execute on function public.finalize_course_certificate(uuid, text, text) from public, anon, authenticated;
revoke execute on function public.get_my_course_rating(uuid) from public, anon;
revoke execute on function public.save_course_rating(uuid, smallint, text) from public, anon;
revoke execute on function public.delete_course_rating(uuid) from public, anon;

grant execute on function public.get_my_certificates() to authenticated, service_role;
grant execute on function public.get_my_course_certificate(uuid) to authenticated, service_role;
grant execute on function public.authorize_course_certificate_generation(uuid) to authenticated, service_role;
grant execute on function public.finalize_course_certificate(uuid, text, text) to service_role;
grant execute on function public.get_my_course_rating(uuid) to authenticated, service_role;
grant execute on function public.save_course_rating(uuid, smallint, text) to authenticated, service_role;
grant execute on function public.delete_course_rating(uuid) to authenticated, service_role;

comment on function public.check_course_completion(uuid) is
  'Finaliza de forma idempotente la matrícula y reserva un certificado de curso único.';
comment on table public.course_ratings is
  'Valoración editable de 1 a 5 disponible únicamente tras completar el curso.';
