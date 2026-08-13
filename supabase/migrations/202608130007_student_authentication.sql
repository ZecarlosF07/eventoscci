create or replace function public.handle_campus_user_registration()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_metadata jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_document_type_text text := lower(btrim(v_metadata->>'document_type'));
  v_document_type public.document_type;
  v_document_number text := upper(btrim(v_metadata->>'document_number'));
  v_first_names text := btrim(v_metadata->>'first_names');
  v_last_names text := btrim(v_metadata->>'last_names');
  v_email text := lower(btrim(new.email));
  v_phone text := btrim(v_metadata->>'phone');
  v_job_title text := btrim(v_metadata->>'job_title');
  v_company text := nullif(btrim(v_metadata->>'company'), '');
  v_ruc text := nullif(btrim(v_metadata->>'ruc'), '');
  v_address text := nullif(btrim(v_metadata->>'address'), '');
  v_person public.people%rowtype;
begin
  if v_metadata->>'registration_source' is distinct from 'campus' then
    return new;
  end if;

  if v_document_type_text not in ('dni', 'ce') then
    raise exception 'REGISTRATION_INVALID_DOCUMENT_TYPE' using errcode = '22023';
  end if;
  v_document_type := v_document_type_text::public.document_type;

  if (v_document_type = 'dni' and v_document_number !~ '^[0-9]{8}$')
    or (v_document_type = 'ce' and v_document_number !~ '^[A-Z0-9]{6,20}$') then
    raise exception 'REGISTRATION_INVALID_DOCUMENT' using errcode = '22023';
  end if;
  if v_first_names is null or length(v_first_names) < 2 or length(v_first_names) > 120
    or v_last_names is null or length(v_last_names) < 2 or length(v_last_names) > 120
    or v_email is null or length(v_email) > 320
    or v_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    or v_phone is null or v_phone !~ '^[0-9]{9,15}$'
    or v_job_title is null or length(v_job_title) < 2 or length(v_job_title) > 160
    or (v_company is not null and length(v_company) > 180)
    or (v_ruc is not null and v_ruc !~ '^[0-9]{11}$')
    or (v_address is not null and length(v_address) > 300) then
    raise exception 'REGISTRATION_INVALID_PROFILE' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended('campus-account:' || v_document_type_text || ':' || v_document_number, 0)
  );

  select * into v_person
  from public.people
  where document_type = v_document_type
    and document_number = v_document_number
  for update;

  if found and v_person.deleted_at is not null then
    raise exception 'REGISTRATION_IDENTITY_INACTIVE' using errcode = 'P0001';
  end if;

  if found and exists (
    select 1 from public.user_accounts
    where person_id = v_person.id and deleted_at is null
  ) then
    raise exception 'REGISTRATION_ACCOUNT_EXISTS' using errcode = '23505';
  end if;

  if found then
    update public.people set
      first_names = v_first_names,
      last_names = v_last_names,
      email = v_email,
      phone = v_phone,
      job_title = v_job_title,
      company = coalesce(v_company, company),
      ruc = coalesce(v_ruc, ruc),
      address = coalesce(v_address, address)
    where id = v_person.id
    returning * into v_person;
  else
    insert into public.people (
      document_type, document_number, first_names, last_names, email,
      phone, job_title, company, ruc, address
    ) values (
      v_document_type, v_document_number, v_first_names, v_last_names, v_email,
      v_phone, v_job_title, v_company, v_ruc, v_address
    ) returning * into v_person;
  end if;

  insert into public.user_accounts (user_id, person_id, role, is_active)
  values (new.id, v_person.id, 'student', true);

  return new;
end;
$$;

revoke execute on function public.handle_campus_user_registration() from public, anon, authenticated;

drop trigger if exists on_campus_auth_user_created on auth.users;
create trigger on_campus_auth_user_created
after insert on auth.users
for each row execute function public.handle_campus_user_registration();

grant select on table public.user_accounts to authenticated;

create policy user_accounts_own_read
on public.user_accounts
for select
to authenticated
using (user_id = (select auth.uid()));

create policy user_accounts_admin_read
on public.user_accounts
for select
to authenticated
using ((select public.is_active_admin()));

create policy people_own_read
on public.people
for select
to authenticated
using (
  exists (
    select 1 from public.user_accounts
    where user_accounts.user_id = (select auth.uid())
      and user_accounts.person_id = people.id
      and user_accounts.deleted_at is null
  )
);

create or replace function public.update_own_profile(p_profile jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_person_id uuid;
  v_first_names text := btrim(p_profile->>'first_names');
  v_last_names text := btrim(p_profile->>'last_names');
  v_phone text := btrim(p_profile->>'phone');
  v_job_title text := btrim(p_profile->>'job_title');
  v_company text := nullif(btrim(p_profile->>'company'), '');
  v_ruc text := nullif(btrim(p_profile->>'ruc'), '');
  v_address text := nullif(btrim(p_profile->>'address'), '');
begin
  select person_id into v_person_id
  from public.user_accounts
  where user_id = (select auth.uid())
    and is_active
    and deleted_at is null
  for update;

  if v_person_id is null then
    raise exception 'ACCOUNT_NOT_ACTIVE' using errcode = '42501';
  end if;
  if v_first_names is null or length(v_first_names) < 2 or length(v_first_names) > 120
    or v_last_names is null or length(v_last_names) < 2 or length(v_last_names) > 120
    or v_phone is null or v_phone !~ '^[0-9]{9,15}$'
    or v_job_title is null or length(v_job_title) < 2 or length(v_job_title) > 160
    or (v_company is not null and length(v_company) > 180)
    or (v_ruc is not null and v_ruc !~ '^[0-9]{11}$')
    or (v_address is not null and length(v_address) > 300) then
    raise exception 'PROFILE_VALIDATION_ERROR' using errcode = '22023';
  end if;

  update public.people set
    first_names = v_first_names,
    last_names = v_last_names,
    phone = v_phone,
    job_title = v_job_title,
    company = v_company,
    ruc = v_ruc,
    address = v_address
  where id = v_person_id and deleted_at is null;

  if not found then
    raise exception 'PROFILE_NOT_FOUND' using errcode = 'P0001';
  end if;
  return v_person_id;
end;
$$;

revoke execute on function public.update_own_profile(jsonb) from public, anon;
grant execute on function public.update_own_profile(jsonb) to authenticated, service_role;

comment on function public.handle_campus_user_registration() is
  'Vincula atómicamente un alta de Supabase Auth con la persona institucional y una cuenta student.';
comment on function public.update_own_profile(jsonb) is
  'Actualiza únicamente los campos editables del perfil perteneciente a la cuenta autenticada activa.';
