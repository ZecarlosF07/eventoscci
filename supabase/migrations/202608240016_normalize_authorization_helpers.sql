-- Boolean helpers must return false, not NULL, when tests or direct SQL omit a JWT role claim.

create or replace function public.is_internal_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select auth.role()) = 'service_role', false)
    or coalesce(public.current_user_role() in ('operator', 'administrator'), false);
$$;

create or replace function public.is_administrator()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select auth.role()) = 'service_role', false)
    or coalesce(public.current_user_role() = 'administrator', false);
$$;

revoke execute on function public.is_internal_user() from public, anon;
revoke execute on function public.is_administrator() from public, anon;
grant execute on function public.is_internal_user() to authenticated, service_role;
grant execute on function public.is_administrator() to authenticated, service_role;
