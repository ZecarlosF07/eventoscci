create or replace function public.get_public_course_curriculum(p_course_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', module.id,
        'title', module.title,
        'description', module.description,
        'sort_order', module.sort_order,
        'lessons', coalesce(
          (
            select jsonb_agg(
              jsonb_build_object(
                'title', lesson.title,
                'duration_seconds', lesson.duration_seconds,
                'is_required', lesson.is_required,
                'sort_order', lesson.sort_order
              ) order by lesson.sort_order, lesson.id
            )
            from public.lessons as lesson
            where lesson.module_id = module.id
              and lesson.is_published
              and lesson.deleted_at is null
          ),
          '[]'::jsonb
        )
      ) order by module.sort_order, module.id
    ),
    '[]'::jsonb
  )
  from public.course_modules as module
  inner join public.courses as course on course.id = module.course_id
  where course.id = p_course_id
    and course.status = 'published'
    and course.published_at is not null
    and course.deleted_at is null
    and module.is_published
    and module.deleted_at is null;
$$;

revoke all on function public.get_public_course_curriculum(uuid) from public;
grant execute on function public.get_public_course_curriculum(uuid) to anon, authenticated, service_role;

comment on function public.get_public_course_curriculum(uuid) is
  'Returns the published, public-safe curriculum for a published course without exposing video data.';
