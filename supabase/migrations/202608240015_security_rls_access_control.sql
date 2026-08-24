-- Hito 11: capa definitiva de autorización para tablas, RPC y Storage.

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select account.role
  from public.user_accounts account
  join public.people person on person.id = account.person_id
  where account.user_id = (select auth.uid())
    and account.is_active
    and account.deleted_at is null
    and person.deleted_at is null
  limit 1;
$$;

create or replace function public.current_person_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select account.person_id
  from public.user_accounts account
  join public.people person on person.id = account.person_id
  where account.user_id = (select auth.uid())
    and account.is_active
    and account.deleted_at is null
    and person.deleted_at is null
  limit 1;
$$;

create or replace function public.is_internal_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.role()) = 'service_role'
    or coalesce(public.current_user_role() in ('operator', 'administrator'), false);
$$;

create or replace function public.is_administrator()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.role()) = 'service_role'
    or coalesce(public.current_user_role() = 'administrator', false);
$$;

-- Alias conservado para no romper las funciones y políticas de los hitos previos.
create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_internal_user();
$$;

-- Todas las tablas de aplicación expuestas por PostgREST deben estar bajo RLS.
alter table public.people enable row level security;
alter table public.user_accounts enable row level security;
alter table public.categories enable row level security;
alter table public.speakers enable row level security;
alter table public.activities enable row level security;
alter table public.activity_dates enable row level security;
alter table public.activity_speakers enable row level security;
alter table public.registrations enable row level security;
alter table public.attendance enable row level security;
alter table public.notification_outbox enable row level security;
alter table public.audit_logs enable row level security;
alter table public.certificate_templates enable row level security;
alter table public.certificate_template_signers enable row level security;
alter table public.certificates enable row level security;
alter table public.courses enable row level security;
alter table public.course_instructors enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.course_materials enable row level security;
alter table public.course_enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_options enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_attempt_answers enable row level security;
alter table public.course_ratings enable row level security;

-- Catálogos: el público ve solo registros publicables; los usuarios internos gestionan.
drop policy if exists categories_internal_all on public.categories;
create policy categories_internal_all on public.categories
for all to authenticated
using ((select public.is_internal_user()))
with check ((select public.is_internal_user()));

drop policy if exists speakers_public_read on public.speakers;
create policy speakers_public_read on public.speakers
for select to anon, authenticated
using (
  deleted_at is null
  and (
    exists (
      select 1
      from public.activity_speakers relation
      join public.activities activity on activity.id = relation.activity_id
      where relation.speaker_id = speakers.id
        and relation.deleted_at is null
        and activity.deleted_at is null
        and activity.published_at is not null
        and activity.status in ('published', 'finished', 'cancelled')
    )
    or exists (
      select 1
      from public.course_instructors relation
      join public.courses course on course.id = relation.course_id
      where relation.speaker_id = speakers.id
        and relation.deleted_at is null
        and course.deleted_at is null
        and course.published_at is not null
        and course.status = 'published'
    )
  )
);

drop policy if exists speakers_internal_all on public.speakers;
create policy speakers_internal_all on public.speakers
for all to authenticated
using ((select public.is_internal_user()))
with check ((select public.is_internal_user()));

grant insert, update, delete on table public.categories, public.speakers to authenticated;

-- Una cuenta inactiva conserva únicamente la lectura mínima de su fila de cuenta
-- para que la aplicación pueda mostrar el estado; no conserva acceso a su persona.
drop policy if exists people_own_read on public.people;
create policy people_own_read on public.people
for select to authenticated
using (id = public.current_person_id());

drop policy if exists people_admin_read on public.people;
create policy people_admin_read on public.people
for select to authenticated
using ((select public.is_internal_user()) and deleted_at is null);

drop policy if exists user_accounts_admin_read on public.user_accounts;
create policy user_accounts_admin_read on public.user_accounts
for select to authenticated
using ((select public.is_internal_user()) and deleted_at is null);

-- Auditoría es la única diferencia de lectura entre operator y administrator en el MVP.
drop policy if exists audit_logs_admin_read on public.audit_logs;
create policy audit_logs_administrator_read on public.audit_logs
for select to authenticated
using ((select public.is_administrator()));

-- El acceso a un archivo privado exige además que exista el recurso funcional publicado.
drop policy if exists course_material_files_student_read on storage.objects;
create policy course_material_files_student_read on storage.objects
for select to authenticated
using (
  bucket_id = 'course-materials'
  and exists (
    select 1
    from public.course_materials material
    where material.storage_path = storage.objects.name
      and material.material_type = 'file'
      and material.deleted_at is null
      and public.has_active_course_enrollment(material.course_id)
  )
);

drop policy if exists course_video_files_student_read on storage.objects;
create policy course_video_files_student_read on storage.objects
for select to authenticated
using (
  bucket_id = 'course-videos'
  and exists (
    select 1
    from public.lessons lesson
    join public.course_modules module on module.id = lesson.module_id
    where lesson.video_storage_path = storage.objects.name
      and lesson.video_provider = 'supabase'
      and lesson.is_published
      and lesson.deleted_at is null
      and module.is_published
      and module.deleted_at is null
      and public.has_active_course_enrollment(module.course_id)
  )
);

drop policy if exists certificates_storage_owner_read on storage.objects;
create policy certificates_storage_owner_read on storage.objects
for select to authenticated
using (
  bucket_id = 'certificates'
  and split_part(name, '/', 1) = 'issued'
  and split_part(name, '/', 2) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and exists (
    select 1
    from public.certificates certificate
    where certificate.id::text = split_part(storage.objects.name, '/', 2)
      and certificate.person_id = public.current_person_id()
      and certificate.status = 'issued'
      and certificate.file_path = storage.objects.name
      and certificate.deleted_at is null
  )
);

-- Los buckets funcionalmente privados no pueden quedar públicos por configuración manual.
update storage.buckets set public = false
where id in ('certificates', 'course-materials', 'course-videos');

-- Denegación por defecto para RPC. Cada operación de cliente se habilita abajo.
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on all functions in schema public to service_role;

grant execute on function public.get_activity_registration_availability(uuid) to anon, authenticated;
grant execute on function public.get_public_certificate(text) to anon, authenticated;
grant execute on function public.get_public_registration_result(text) to anon, authenticated;
grant execute on function public.register_activity(uuid, jsonb) to anon, authenticated;

grant execute on function public.current_user_role() to authenticated;
grant execute on function public.current_person_id() to authenticated;
grant execute on function public.is_internal_user() to authenticated;
grant execute on function public.is_administrator() to authenticated;
grant execute on function public.is_active_admin() to authenticated;
grant execute on function public.has_active_course_enrollment(uuid) to authenticated;
grant execute on function public.enroll_free_course(uuid) to authenticated;
grant execute on function public.update_own_profile(jsonb) to authenticated;
grant execute on function public.update_lesson_progress(uuid, uuid, integer, integer) to authenticated;
grant execute on function public.check_course_completion(uuid) to authenticated;
grant execute on function public.get_student_course_quiz_summaries(uuid) to authenticated;
grant execute on function public.get_student_quiz(uuid, uuid) to authenticated;
grant execute on function public.get_quiz_attempts(uuid, uuid) to authenticated;
grant execute on function public.get_quiz_attempt_result(uuid) to authenticated;
grant execute on function public.submit_quiz_attempt(uuid, uuid, jsonb) to authenticated;
grant execute on function public.get_my_certificates() to authenticated;
grant execute on function public.get_my_course_certificate(uuid) to authenticated;
grant execute on function public.authorize_course_certificate_generation(uuid) to authenticated;
grant execute on function public.get_my_course_rating(uuid) to authenticated;
grant execute on function public.save_course_rating(uuid, smallint, text) to authenticated;
grant execute on function public.delete_course_rating(uuid) to authenticated;

grant execute on function public.save_activity(jsonb, jsonb, jsonb) to authenticated;
grant execute on function public.set_activity_status(uuid, public.activity_status) to authenticated;
grant execute on function public.soft_delete_activity(uuid) to authenticated;
grant execute on function public.confirm_registration(uuid) to authenticated;
grant execute on function public.cancel_registration(uuid, text) to authenticated;
grant execute on function public.update_participant(uuid, jsonb) to authenticated;
grant execute on function public.set_attendance_status(uuid[], public.attendance_status, text) to authenticated;
grant execute on function public.save_certificate_template(jsonb, jsonb) to authenticated;
grant execute on function public.soft_delete_certificate_template(uuid) to authenticated;
grant execute on function public.prepare_activity_certificates(uuid[], uuid, text) to authenticated;
grant execute on function public.finalize_activity_certificate(uuid, text, text) to authenticated;
grant execute on function public.abandon_unfinalized_certificate(uuid) to authenticated;
grant execute on function public.revoke_certificate(uuid, text) to authenticated;
grant execute on function public.retry_notification(uuid) to authenticated;
grant execute on function public.save_course(jsonb, jsonb) to authenticated;
grant execute on function public.set_course_status(uuid, public.course_status) to authenticated;
grant execute on function public.grant_course_access(uuid, uuid, public.registration_type, numeric) to authenticated;
grant execute on function public.revoke_course_access(uuid, text) to authenticated;
grant execute on function public.save_quiz(jsonb, jsonb) to authenticated;
grant execute on function public.get_admin_quiz(uuid) to authenticated;

alter default privileges in schema public revoke execute on functions from public;

comment on function public.current_user_role() is
  'Rol de la cuenta activa vinculada a auth.uid(); NULL para cuentas inactivas o eliminadas.';
comment on function public.is_internal_user() is
  'Autoriza operator, administrator y procesos service_role confiables.';
comment on function public.is_administrator() is
  'Autoriza acciones reservadas al administrator y procesos service_role confiables.';
