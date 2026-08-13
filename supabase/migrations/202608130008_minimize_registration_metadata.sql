create or replace function public.scrub_campus_registration_metadata()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(new.raw_user_meta_data, '{}'::jsonb)->>'registration_source' = 'campus' then
    update auth.users set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
      - 'registration_source'
      - 'document_type'
      - 'document_number'
      - 'first_names'
      - 'last_names'
      - 'phone'
      - 'job_title'
      - 'company'
      - 'ruc'
      - 'address'
      - 'role'
    where id = new.id;
  end if;
  return new;
end;
$$;

revoke execute on function public.scrub_campus_registration_metadata() from public, anon, authenticated;

drop trigger if exists zz_scrub_campus_auth_metadata on auth.users;
create trigger zz_scrub_campus_auth_metadata
after insert on auth.users
for each row execute function public.scrub_campus_registration_metadata();

comment on function public.scrub_campus_registration_metadata() is
  'Retira de Auth los datos de negocio usados transitoriamente para vincular una cuenta del Campus.';
