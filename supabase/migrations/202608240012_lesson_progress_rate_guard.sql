create or replace function public.enforce_lesson_progress_increment()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_allowed_increment integer;
  v_duration integer;
  v_elapsed_seconds integer;
  v_progress_percent numeric(5, 2);
begin
  v_duration := coalesce(
    new.duration_seconds_snapshot,
    (select duration_seconds from public.lessons where id = new.lesson_id)
  );

  if v_duration is null or v_duration <= 0 then
    raise exception 'LESSON_DURATION_REQUIRED' using errcode = 'P0001';
  end if;

  if tg_op = 'INSERT' then
    new.watched_seconds := least(new.watched_seconds, 30, v_duration);
  elsif new.watched_seconds > old.watched_seconds then
    v_elapsed_seconds := greatest(
      floor(extract(epoch from (now() - coalesce(old.last_watched_at, old.created_at))))::integer,
      0
    );
    v_allowed_increment := least(greatest((v_elapsed_seconds * 2) + 2, 2), 30);
    new.watched_seconds := least(
      new.watched_seconds,
      old.watched_seconds + v_allowed_increment,
      v_duration
    );
  end if;

  v_progress_percent := round(
    (new.watched_seconds::numeric / v_duration::numeric) * 100,
    2
  );
  new.duration_seconds_snapshot := v_duration;
  if tg_op = 'INSERT' then
    new.progress_percent := v_progress_percent;
    new.is_completed := new.progress_percent >= 90;
    new.completed_at := case when new.is_completed then coalesce(new.completed_at, now()) else null end;
  else
    new.progress_percent := greatest(old.progress_percent, v_progress_percent);
    new.is_completed := old.is_completed or new.progress_percent >= 90;
    new.completed_at := case
      when new.is_completed then coalesce(old.completed_at, new.completed_at, now())
      else null
    end;
  end if;

  return new;
end;
$$;

create trigger enforce_lesson_progress_increment
before insert or update on public.lesson_progress
for each row execute function public.enforce_lesson_progress_increment();

revoke execute on function public.enforce_lesson_progress_increment() from public, anon, authenticated;
grant execute on function public.enforce_lesson_progress_increment() to service_role;

comment on function public.enforce_lesson_progress_increment() is
  'Limita incrementos según duración y tiempo transcurrido para dificultar solicitudes repetidas manipuladas.';
