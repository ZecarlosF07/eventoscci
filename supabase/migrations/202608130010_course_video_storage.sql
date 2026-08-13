insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'course-videos',
  'course-videos',
  false,
  524288000,
  array['video/mp4', 'video/webm', 'video/ogg', 'application/x-mpegURL']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy course_video_files_admin_read
on storage.objects for select to authenticated
using (bucket_id = 'course-videos' and (select public.is_active_admin()));

create policy course_video_files_student_read
on storage.objects for select to authenticated
using (
  bucket_id = 'course-videos'
  and split_part(name, '/', 1) ~ '^[0-9a-f-]{36}$'
  and exists (
    select 1 from public.courses
    where courses.id::text = split_part(storage.objects.name, '/', 1)
      and public.has_active_course_enrollment(courses.id)
  )
);

create policy course_video_files_admin_insert
on storage.objects for insert to authenticated
with check (bucket_id = 'course-videos' and (select public.is_active_admin()));

create policy course_video_files_admin_update
on storage.objects for update to authenticated
using (bucket_id = 'course-videos' and (select public.is_active_admin()))
with check (bucket_id = 'course-videos' and (select public.is_active_admin()));

create policy course_video_files_admin_delete
on storage.objects for delete to authenticated
using (bucket_id = 'course-videos' and (select public.is_active_admin()));
