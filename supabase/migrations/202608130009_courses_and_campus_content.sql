create type public.course_status as enum ('draft', 'published', 'archived');
create type public.course_enrollment_status as enum ('active', 'completed', 'revoked');
create type public.material_type as enum ('file', 'external_link');

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title varchar(200) not null,
  slug varchar(220) not null,
  short_description text,
  description text not null,
  objectives text,
  contents_overview text,
  duration_text varchar(100),
  academic_hours numeric(6, 2),
  banner_path text,
  is_free boolean not null default false,
  general_price numeric(10, 2) not null default 0,
  member_price numeric(10, 2) not null default 0,
  status public.course_status not null default 'draft',
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  constraint courses_title_not_blank check (length(btrim(title)) > 0),
  constraint courses_slug_canonical check (
    slug = lower(btrim(slug))
    and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint courses_description_not_blank check (length(btrim(description)) > 0),
  constraint courses_academic_hours_nonnegative check (academic_hours is null or academic_hours >= 0),
  constraint courses_general_price_nonnegative check (general_price >= 0),
  constraint courses_member_price_nonnegative check (member_price >= 0),
  constraint courses_free_prices_zero check (not is_free or (general_price = 0 and member_price = 0)),
  constraint courses_deleted_by_consistency check (deleted_at is not null or deleted_by is null)
);

create table public.course_instructors (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  speaker_id uuid not null references public.speakers(id) on delete restrict,
  is_primary boolean not null default false,
  role_label text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  constraint course_instructors_sort_order_nonnegative check (sort_order >= 0),
  constraint course_instructors_deleted_by_consistency check (deleted_at is not null or deleted_by is null)
);

create table public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title varchar(200) not null,
  description text,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  constraint course_modules_title_not_blank check (length(btrim(title)) > 0),
  constraint course_modules_sort_order_nonnegative check (sort_order >= 0),
  constraint course_modules_deleted_by_consistency check (deleted_at is not null or deleted_by is null)
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.course_modules(id) on delete cascade,
  title varchar(200) not null,
  description text,
  sort_order integer not null default 0,
  video_provider varchar(50),
  video_asset_id text,
  video_storage_path text,
  duration_seconds integer,
  is_required boolean not null default true,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  constraint lessons_title_not_blank check (length(btrim(title)) > 0),
  constraint lessons_sort_order_nonnegative check (sort_order >= 0),
  constraint lessons_duration_positive check (duration_seconds is null or duration_seconds > 0),
  constraint lessons_deleted_by_consistency check (deleted_at is not null or deleted_by is null)
);

create table public.course_materials (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title varchar(200) not null,
  description text,
  material_type public.material_type not null,
  storage_path text,
  external_url text,
  mime_type text,
  file_size_bytes bigint,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  constraint course_materials_title_not_blank check (length(btrim(title)) > 0),
  constraint course_materials_sort_order_nonnegative check (sort_order >= 0),
  constraint course_materials_file_size_nonnegative check (file_size_bytes is null or file_size_bytes >= 0),
  constraint course_materials_source_valid check (
    (material_type = 'file' and storage_path is not null and length(btrim(storage_path)) > 0 and external_url is null)
    or
    (material_type = 'external_link' and external_url is not null and length(btrim(external_url)) > 0 and storage_path is null)
  ),
  constraint course_materials_deleted_by_consistency check (deleted_at is not null or deleted_by is null)
);

create table public.course_enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete restrict,
  person_id uuid not null references public.people(id) on delete restrict,
  status public.course_enrollment_status not null default 'active',
  registration_type public.registration_type not null default 'general',
  price_snapshot numeric(10, 2) not null default 0,
  progress_percent numeric(5, 2) not null default 0,
  access_granted_at timestamptz not null default now(),
  access_granted_by uuid references auth.users(id) on delete set null,
  completed_at timestamptz,
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id) on delete set null,
  revocation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id) on delete set null,
  constraint course_enrollments_price_nonnegative check (price_snapshot >= 0),
  constraint course_enrollments_progress_range check (progress_percent between 0 and 100),
  constraint course_enrollments_revocation_consistency check (
    (status = 'revoked' and revoked_at is not null)
    or (status <> 'revoked' and revoked_at is null and revoked_by is null and revocation_reason is null)
  ),
  constraint course_enrollments_deleted_by_consistency check (deleted_at is not null or deleted_by is null)
);

create unique index uq_courses_slug_active on public.courses(slug) where deleted_at is null;
create index idx_courses_status on public.courses(status) where deleted_at is null;
create index idx_courses_published_at on public.courses(published_at desc) where deleted_at is null;
create unique index uq_course_instructor_active on public.course_instructors(course_id, speaker_id) where deleted_at is null;
create unique index uq_course_primary_instructor_active on public.course_instructors(course_id) where is_primary and deleted_at is null;
create index idx_course_instructors_order on public.course_instructors(course_id, sort_order) where deleted_at is null;
create index idx_course_modules_order on public.course_modules(course_id, sort_order) where deleted_at is null;
create index idx_lessons_order on public.lessons(module_id, sort_order) where deleted_at is null;
create index idx_course_materials_order on public.course_materials(course_id, sort_order) where deleted_at is null;
create unique index uq_course_enrollment_active on public.course_enrollments(course_id, person_id) where deleted_at is null;
create index idx_course_enrollments_person_status on public.course_enrollments(person_id, status) where deleted_at is null;
create index idx_course_enrollments_course on public.course_enrollments(course_id) where deleted_at is null;

create trigger set_courses_updated_at before update on public.courses
for each row execute function public.set_updated_at();
create trigger set_course_instructors_updated_at before update on public.course_instructors
for each row execute function public.set_updated_at();
create trigger set_course_modules_updated_at before update on public.course_modules
for each row execute function public.set_updated_at();
create trigger set_lessons_updated_at before update on public.lessons
for each row execute function public.set_updated_at();
create trigger set_course_materials_updated_at before update on public.course_materials
for each row execute function public.set_updated_at();
create trigger set_course_enrollments_updated_at before update on public.course_enrollments
for each row execute function public.set_updated_at();

create or replace function public.current_person_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select person_id
  from public.user_accounts
  where user_id = (select auth.uid())
    and is_active
    and deleted_at is null
  limit 1;
$$;

create or replace function public.has_active_course_enrollment(p_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.course_enrollments
    where course_id = p_course_id
      and person_id = public.current_person_id()
      and status in ('active', 'completed')
      and deleted_at is null
  );
$$;

create or replace function public.save_course(p_course jsonb, p_instructors jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_course_id uuid := nullif(p_course->>'id', '')::uuid;
  v_instructor jsonb;
  v_status public.course_status := coalesce(nullif(p_course->>'status', '')::public.course_status, 'draft');
begin
  if not public.is_active_admin() then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;

  if jsonb_typeof(p_instructors) <> 'array' then
    raise exception 'INVALID_INSTRUCTORS' using errcode = '22023';
  end if;

  if v_course_id is null then
    v_course_id := extensions.gen_random_uuid();
  end if;

  if not exists (select 1 from public.courses where id = v_course_id) then
    insert into public.courses (
      id, title, slug, short_description, description, objectives, contents_overview,
      duration_text, academic_hours, banner_path, is_free, general_price,
      member_price, status, published_at, created_by, updated_by
    ) values (
      v_course_id, btrim(p_course->>'title'), btrim(p_course->>'slug'),
      nullif(btrim(p_course->>'short_description'), ''), btrim(p_course->>'description'),
      nullif(btrim(p_course->>'objectives'), ''), nullif(btrim(p_course->>'contents_overview'), ''),
      nullif(btrim(p_course->>'duration_text'), ''), nullif(p_course->>'academic_hours', '')::numeric,
      nullif(btrim(p_course->>'banner_path'), ''), coalesce((p_course->>'is_free')::boolean, false),
      coalesce(nullif(p_course->>'general_price', '')::numeric, 0),
      coalesce(nullif(p_course->>'member_price', '')::numeric, 0), v_status,
      case when v_status = 'published' then now() else null end,
      auth.uid(), auth.uid()
    ) returning id into v_course_id;
  else
    update public.courses set
      title = btrim(p_course->>'title'),
      slug = btrim(p_course->>'slug'),
      short_description = nullif(btrim(p_course->>'short_description'), ''),
      description = btrim(p_course->>'description'),
      objectives = nullif(btrim(p_course->>'objectives'), ''),
      contents_overview = nullif(btrim(p_course->>'contents_overview'), ''),
      duration_text = nullif(btrim(p_course->>'duration_text'), ''),
      academic_hours = nullif(p_course->>'academic_hours', '')::numeric,
      banner_path = nullif(btrim(p_course->>'banner_path'), ''),
      is_free = coalesce((p_course->>'is_free')::boolean, false),
      general_price = coalesce(nullif(p_course->>'general_price', '')::numeric, 0),
      member_price = coalesce(nullif(p_course->>'member_price', '')::numeric, 0),
      status = v_status,
      published_at = case
        when v_status = 'published' then coalesce(published_at, now())
        else published_at
      end,
      updated_by = auth.uid()
    where id = v_course_id and deleted_at is null;

    if not found then
      raise exception 'COURSE_NOT_FOUND' using errcode = 'P0001';
    end if;

    update public.course_instructors
    set deleted_at = now(), deleted_by = auth.uid()
    where course_id = v_course_id and deleted_at is null;
  end if;

  for v_instructor in select value from jsonb_array_elements(p_instructors)
  loop
    insert into public.course_instructors (
      course_id, speaker_id, is_primary, role_label, sort_order
    ) values (
      v_course_id,
      (v_instructor->>'speaker_id')::uuid,
      coalesce((v_instructor->>'is_primary')::boolean, false),
      nullif(btrim(v_instructor->>'role_label'), ''),
      coalesce((v_instructor->>'sort_order')::integer, 0)
    );
  end loop;

  return v_course_id;
end;
$$;

create or replace function public.set_course_status(p_course_id uuid, p_status public.course_status)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_active_admin() then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;

  update public.courses
  set status = p_status,
      published_at = case when p_status = 'published' then coalesce(published_at, now()) else published_at end,
      updated_by = auth.uid()
  where id = p_course_id and deleted_at is null;

  if not found then raise exception 'COURSE_NOT_FOUND' using errcode = 'P0001'; end if;
end;
$$;

create or replace function public.enroll_free_course(p_course_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_course public.courses%rowtype;
  v_enrollment_id uuid;
  v_person_id uuid := public.current_person_id();
begin
  if v_person_id is null then raise exception 'ACCOUNT_NOT_ACTIVE' using errcode = '42501'; end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_course_id::text || ':' || v_person_id::text, 0));

  select * into v_course from public.courses
  where id = p_course_id and deleted_at is null and status = 'published';
  if not found then raise exception 'COURSE_NOT_AVAILABLE' using errcode = 'P0001'; end if;
  if not v_course.is_free then raise exception 'COURSE_NOT_FREE' using errcode = 'P0001'; end if;

  select id into v_enrollment_id from public.course_enrollments
  where course_id = p_course_id and person_id = v_person_id and deleted_at is null;

  if v_enrollment_id is not null then
    update public.course_enrollments
    set status = 'active', registration_type = 'general', price_snapshot = 0,
        access_granted_at = now(), access_granted_by = auth.uid(),
        revoked_at = null, revoked_by = null, revocation_reason = null
    where id = v_enrollment_id;
    return v_enrollment_id;
  end if;

  insert into public.course_enrollments (
    course_id, person_id, status, registration_type, price_snapshot,
    access_granted_at, access_granted_by
  ) values (p_course_id, v_person_id, 'active', 'general', 0, now(), auth.uid())
  returning id into v_enrollment_id;

  return v_enrollment_id;
end;
$$;

create or replace function public.grant_course_access(
  p_course_id uuid,
  p_person_id uuid,
  p_registration_type public.registration_type,
  p_price_snapshot numeric default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_course public.courses%rowtype;
  v_enrollment_id uuid;
  v_price numeric(10, 2);
begin
  if not public.is_active_admin() then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;

  select * into v_course from public.courses where id = p_course_id and deleted_at is null;
  if not found then raise exception 'COURSE_NOT_FOUND' using errcode = 'P0001'; end if;
  if not exists (select 1 from public.people where id = p_person_id and deleted_at is null) then
    raise exception 'PERSON_NOT_FOUND' using errcode = 'P0001';
  end if;

  v_price := coalesce(p_price_snapshot, case when p_registration_type = 'member' then v_course.member_price else v_course.general_price end);
  if v_price < 0 then raise exception 'INVALID_PRICE' using errcode = '22023'; end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_course_id::text || ':' || p_person_id::text, 0));
  select id into v_enrollment_id from public.course_enrollments
  where course_id = p_course_id and person_id = p_person_id and deleted_at is null;

  if v_enrollment_id is null then
    insert into public.course_enrollments (
      course_id, person_id, status, registration_type, price_snapshot,
      access_granted_at, access_granted_by
    ) values (
      p_course_id, p_person_id, 'active', p_registration_type, v_price, now(), auth.uid()
    ) returning id into v_enrollment_id;
  else
    update public.course_enrollments set
      status = 'active', registration_type = p_registration_type,
      price_snapshot = v_price, access_granted_at = now(), access_granted_by = auth.uid(),
      revoked_at = null, revoked_by = null, revocation_reason = null
    where id = v_enrollment_id;
  end if;

  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, new_data)
  values (auth.uid(), 'course_access_granted', 'course_enrollment', v_enrollment_id,
    jsonb_build_object('course_id', p_course_id, 'person_id', p_person_id, 'price_snapshot', v_price));
  return v_enrollment_id;
end;
$$;

create or replace function public.revoke_course_access(p_enrollment_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old public.course_enrollments%rowtype;
begin
  if not public.is_active_admin() then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  if length(btrim(coalesce(p_reason, ''))) < 3 then raise exception 'REVOCATION_REASON_REQUIRED' using errcode = '22023'; end if;

  select * into v_old from public.course_enrollments
  where id = p_enrollment_id and deleted_at is null for update;
  if not found then raise exception 'ENROLLMENT_NOT_FOUND' using errcode = 'P0001'; end if;

  update public.course_enrollments set
    status = 'revoked', revoked_at = now(), revoked_by = auth.uid(),
    revocation_reason = btrim(p_reason)
  where id = p_enrollment_id;

  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, old_data, new_data)
  values (auth.uid(), 'course_access_revoked', 'course_enrollment', p_enrollment_id,
    to_jsonb(v_old), jsonb_build_object('status', 'revoked', 'reason', btrim(p_reason)));
end;
$$;

alter table public.courses enable row level security;
alter table public.course_instructors enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.course_materials enable row level security;
alter table public.course_enrollments enable row level security;

revoke all on table public.courses, public.course_instructors, public.course_modules,
  public.lessons, public.course_materials, public.course_enrollments from anon, authenticated;
grant select on table public.courses, public.course_instructors, public.course_modules to anon, authenticated;
grant select on table public.lessons, public.course_materials, public.course_enrollments to authenticated;
grant insert, update, delete on table public.courses, public.course_instructors, public.course_modules,
  public.lessons, public.course_materials to authenticated;
grant all on table public.courses, public.course_instructors, public.course_modules,
  public.lessons, public.course_materials, public.course_enrollments to service_role;

create policy courses_public_read on public.courses for select to anon, authenticated
using (deleted_at is null and status = 'published' and published_at is not null);
create policy courses_admin_all on public.courses for all to authenticated
using ((select public.is_active_admin())) with check ((select public.is_active_admin()));

create policy course_instructors_public_read on public.course_instructors for select to anon, authenticated
using (deleted_at is null and exists (
  select 1 from public.courses where courses.id = course_instructors.course_id
  and courses.deleted_at is null and courses.status = 'published' and courses.published_at is not null
));
create policy course_instructors_admin_all on public.course_instructors for all to authenticated
using ((select public.is_active_admin())) with check ((select public.is_active_admin()));

create policy course_modules_public_read on public.course_modules for select to anon, authenticated
using (deleted_at is null and is_published and exists (
  select 1 from public.courses where courses.id = course_modules.course_id
  and courses.deleted_at is null and courses.status = 'published' and courses.published_at is not null
));
create policy course_modules_admin_all on public.course_modules for all to authenticated
using ((select public.is_active_admin())) with check ((select public.is_active_admin()));

create policy lessons_student_read on public.lessons for select to authenticated
using (deleted_at is null and is_published and exists (
  select 1 from public.course_modules
  where course_modules.id = lessons.module_id and course_modules.deleted_at is null
    and course_modules.is_published and public.has_active_course_enrollment(course_modules.course_id)
));
create policy lessons_admin_all on public.lessons for all to authenticated
using ((select public.is_active_admin())) with check ((select public.is_active_admin()));

create policy course_materials_student_read on public.course_materials for select to authenticated
using (deleted_at is null and public.has_active_course_enrollment(course_id));
create policy course_materials_admin_all on public.course_materials for all to authenticated
using ((select public.is_active_admin())) with check ((select public.is_active_admin()));

create policy course_enrollments_own_read on public.course_enrollments for select to authenticated
using (deleted_at is null and person_id = public.current_person_id());
create policy course_enrollments_admin_read on public.course_enrollments for select to authenticated
using ((select public.is_active_admin()));

revoke execute on function public.current_person_id() from public, anon;
revoke execute on function public.has_active_course_enrollment(uuid) from public, anon;
revoke execute on function public.save_course(jsonb, jsonb) from public, anon;
revoke execute on function public.set_course_status(uuid, public.course_status) from public, anon;
revoke execute on function public.enroll_free_course(uuid) from public, anon;
revoke execute on function public.grant_course_access(uuid, uuid, public.registration_type, numeric) from public, anon;
revoke execute on function public.revoke_course_access(uuid, text) from public, anon;
grant execute on function public.current_person_id() to authenticated, service_role;
grant execute on function public.has_active_course_enrollment(uuid) to authenticated, service_role;
grant execute on function public.save_course(jsonb, jsonb) to authenticated, service_role;
grant execute on function public.set_course_status(uuid, public.course_status) to authenticated, service_role;
grant execute on function public.enroll_free_course(uuid) to authenticated, service_role;
grant execute on function public.grant_course_access(uuid, uuid, public.registration_type, numeric) to authenticated, service_role;
grant execute on function public.revoke_course_access(uuid, text) to authenticated, service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('course-banners', 'course-banners', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('course-materials', 'course-materials', false, 52428800,
  array[
    'application/pdf', 'application/zip', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv', 'image/jpeg', 'image/png', 'image/webp'
  ])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy course_banners_public_read on storage.objects for select to anon, authenticated
using (bucket_id = 'course-banners');
create policy course_banners_admin_insert on storage.objects for insert to authenticated
with check (bucket_id = 'course-banners' and (select public.is_active_admin()));
create policy course_banners_admin_update on storage.objects for update to authenticated
using (bucket_id = 'course-banners' and (select public.is_active_admin()))
with check (bucket_id = 'course-banners' and (select public.is_active_admin()));
create policy course_banners_admin_delete on storage.objects for delete to authenticated
using (bucket_id = 'course-banners' and (select public.is_active_admin()));

create policy course_material_files_admin_read on storage.objects for select to authenticated
using (bucket_id = 'course-materials' and (select public.is_active_admin()));
create policy course_material_files_student_read on storage.objects for select to authenticated
using (
  bucket_id = 'course-materials'
  and split_part(name, '/', 1) ~ '^[0-9a-f-]{36}$'
  and exists (
    select 1 from public.courses
    where courses.id::text = split_part(storage.objects.name, '/', 1)
      and public.has_active_course_enrollment(courses.id)
  )
);
create policy course_material_files_admin_insert on storage.objects for insert to authenticated
with check (bucket_id = 'course-materials' and (select public.is_active_admin()));
create policy course_material_files_admin_update on storage.objects for update to authenticated
using (bucket_id = 'course-materials' and (select public.is_active_admin()))
with check (bucket_id = 'course-materials' and (select public.is_active_admin()));
create policy course_material_files_admin_delete on storage.objects for delete to authenticated
using (bucket_id = 'course-materials' and (select public.is_active_admin()));

comment on table public.courses is 'Catálogo independiente de cursos grabados del Campus Virtual.';
comment on table public.course_instructors is 'Instructores reutilizados desde speakers y asignados a cursos.';
comment on table public.course_modules is 'Módulos ordenados del contenido académico de un curso.';
comment on table public.lessons is 'Clases con un video configurable por proveedor.';
comment on table public.course_materials is 'Materiales generales del curso, independientes de las clases y del progreso.';
comment on table public.course_enrollments is 'Matrículas históricas y habilitaciones de acceso por persona.';
