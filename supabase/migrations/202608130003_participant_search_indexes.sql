create extension if not exists pg_trgm with schema extensions;

create index idx_people_document_trgm_active
on public.people using gin (document_number extensions.gin_trgm_ops)
where deleted_at is null;

create index idx_people_first_names_trgm_active
on public.people using gin (first_names extensions.gin_trgm_ops)
where deleted_at is null;

create index idx_people_last_names_trgm_active
on public.people using gin (last_names extensions.gin_trgm_ops)
where deleted_at is null;

create index idx_people_email_trgm_active
on public.people using gin (email extensions.gin_trgm_ops)
where deleted_at is null;

create index idx_people_phone_trgm_active
on public.people using gin (phone extensions.gin_trgm_ops)
where deleted_at is null;
