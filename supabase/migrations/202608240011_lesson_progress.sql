create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.course_enrollments(id) on delete restrict,
  lesson_id uuid not null references public.lessons(id) on delete restrict,
  last_position_seconds integer not null default 0,
  watched_seconds integer not null default 0,
  duration_seconds_snapshot integer,
  progress_percent numeric(5, 2) not null default 0,
  is_completed boolean not null default false,
  completed_at timestamptz,
  last_watched_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  constraint lesson_progress_position_nonnegative check (last_position_seconds >= 0),
  constraint lesson_progress_watched_nonnegative check (watched_seconds >= 0),
  constraint lesson_progress_duration_positive check (
    duration_seconds_snapshot is null or duration_seconds_snapshot > 0
  ),
  constraint lesson_progress_percent_range check (progress_percent between 0 and 100),
  constraint lesson_progress_completed_consistency check (
    (is_completed and completed_at is not null) or (not is_completed and completed_at is null)
  ),
  constraint lesson_progress_deleted_by_consistency check (deleted_at is not null or deleted_by is null)
);

create unique index uq_lesson_progress_active
on public.lesson_progress(enrollment_id, lesson_id)
where deleted_at is null;

create index idx_lesson_progress_enrollment
on public.lesson_progress(enrollment_id)
where deleted_at is null;

create index idx_lesson_progress_lesson
on public.lesson_progress(lesson_id)
where deleted_at is null;

create trigger set_lesson_progress_updated_at
before update on public.lesson_progress
for each row execute function public.set_updated_at();

create or replace function public.recalculate_course_progress(p_enrollment_id uuid)
returns numeric
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_course_id uuid;
  v_progress numeric(5, 2);
begin
  select course_id into v_course_id
  from public.course_enrollments
  where id = p_enrollment_id and deleted_at is null
  for update;

  if v_course_id is null then
    raise exception 'ENROLLMENT_NOT_FOUND' using errcode = 'P0001';
  end if;

  select coalesce(round(avg(coalesce(progress.progress_percent, 0)), 2), 0)
  into v_progress
  from public.lessons lesson
  join public.course_modules module on module.id = lesson.module_id
  left join public.lesson_progress progress
    on progress.enrollment_id = p_enrollment_id
    and progress.lesson_id = lesson.id
    and progress.deleted_at is null
  where module.course_id = v_course_id
    and module.is_published
    and module.deleted_at is null
    and lesson.is_required
    and lesson.is_published
    and lesson.deleted_at is null;

  update public.course_enrollments
  set progress_percent = v_progress
  where id = p_enrollment_id;

  return v_progress;
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
  v_pending_count integer;
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
  into v_required_count, v_pending_count
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

  return v_required_count > 0 and v_pending_count = 0;
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
  v_completion_ready boolean;
  v_max_increment constant integer := 30;
begin
  if p_last_position_seconds is null or p_last_position_seconds < 0
    or p_watched_seconds is null or p_watched_seconds < 0 then
    raise exception 'INVALID_PROGRESS_VALUES' using errcode = '22023';
  end if;

  select * into v_enrollment
  from public.course_enrollments
  where id = p_enrollment_id and deleted_at is null
  for update;

  if not found then
    raise exception 'ENROLLMENT_NOT_FOUND' using errcode = 'P0001';
  end if;
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
  where lesson.id = p_lesson_id
    and lesson.deleted_at is null
    and lesson.is_published
    and module.deleted_at is null
    and module.is_published
    and course.deleted_at is null
    and course.status = 'published'
    and course.published_at is not null;

  if not found then
    raise exception 'LESSON_NOT_AVAILABLE' using errcode = 'P0001';
  end if;

  select course_id into v_course_id
  from public.course_modules
  where id = v_lesson.module_id;

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

  select * into v_progress
  from public.lesson_progress
  where enrollment_id = p_enrollment_id
    and lesson_id = p_lesson_id
    and deleted_at is null
  for update;

  v_recognized_watched := least(
    v_lesson.duration_seconds,
    case
      when v_progress.id is null then least(p_watched_seconds, v_max_increment)
      when p_watched_seconds <= v_progress.watched_seconds then v_progress.watched_seconds
      else v_progress.watched_seconds + least(
        p_watched_seconds - v_progress.watched_seconds,
        v_max_increment
      )
    end
  );
  v_progress_percent := round(
    (v_recognized_watched::numeric / v_lesson.duration_seconds::numeric) * 100,
    2
  );
  v_is_completed := coalesce(v_progress.is_completed, false) or v_progress_percent >= 90;

  if v_progress.id is null then
    insert into public.lesson_progress (
      enrollment_id, lesson_id, last_position_seconds, watched_seconds,
      duration_seconds_snapshot, progress_percent, is_completed, completed_at,
      last_watched_at
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
    where id = v_progress.id
    returning * into v_progress;
  end if;

  v_course_progress := public.recalculate_course_progress(p_enrollment_id);
  v_completion_ready := public.check_course_completion(p_enrollment_id);

  return to_jsonb(v_progress) || jsonb_build_object(
    'course_progress_percent', v_course_progress,
    'course_completion_ready', v_completion_ready
  );
end;
$$;

alter table public.lesson_progress enable row level security;

revoke all on table public.lesson_progress from anon, authenticated;
grant select on table public.lesson_progress to authenticated;
grant all on table public.lesson_progress to service_role;

create policy lesson_progress_own_read
on public.lesson_progress for select to authenticated
using (
  deleted_at is null
  and exists (
    select 1 from public.course_enrollments enrollment
    where enrollment.id = lesson_progress.enrollment_id
      and enrollment.person_id = public.current_person_id()
      and enrollment.deleted_at is null
  )
);

create policy lesson_progress_admin_read
on public.lesson_progress for select to authenticated
using ((select public.is_active_admin()));

revoke execute on function public.recalculate_course_progress(uuid) from public, anon, authenticated;
revoke execute on function public.check_course_completion(uuid) from public, anon;
revoke execute on function public.update_lesson_progress(uuid, uuid, integer, integer) from public, anon;
grant execute on function public.recalculate_course_progress(uuid) to service_role;
grant execute on function public.check_course_completion(uuid) to authenticated, service_role;
grant execute on function public.update_lesson_progress(uuid, uuid, integer, integer) to authenticated, service_role;

comment on table public.lesson_progress is
  'Progreso persistente por matrícula y clase; los materiales no participan del cálculo.';
comment on function public.update_lesson_progress(uuid, uuid, integer, integer) is
  'Valida reproducción, aplica la regla del 90 % y recalcula el avance de clases obligatorias.';
comment on function public.check_course_completion(uuid) is
  'Comprueba clases obligatorias; el Hito 9 ampliará la condición con quizzes.';
