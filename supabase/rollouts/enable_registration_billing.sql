-- Apply ONLY after the new public frontend is deployed and verified.
-- Historical rows remain unchanged; new individual paid registrations require billing.
begin;
create or replace function public.registration_billing_enforced()
returns boolean language sql stable set search_path = '' as $$ select true $$;
revoke all on function public.registration_billing_enforced() from public, anon, authenticated;
commit;
