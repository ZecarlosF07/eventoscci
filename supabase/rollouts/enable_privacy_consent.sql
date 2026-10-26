-- Run only after publishing and verifying the updated frontend.
create or replace function public.privacy_consent_enforced() returns boolean
language sql stable set search_path = '' as $$ select true $$;
revoke all on function public.privacy_consent_enforced() from public,anon,authenticated,service_role;
