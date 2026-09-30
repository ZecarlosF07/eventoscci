-- Extend the existing private core without changing the billing/certificate wrappers.
do $$
declare
  v_definition text;
  v_previous_rule text := 'if v_participant_profile = ''professional'' and (v_company is null or length(v_company) < 2) then';
  v_required_rule text := 'if v_participant_profile = ''professional'' and (v_company is null or length(v_company) < 2 or v_ruc is null) then';
begin
  select pg_get_functiondef('public.register_activity_internal_before_billing(uuid,jsonb)'::regprocedure)
  into v_definition;

  if strpos(v_definition, v_previous_rule) = 0 then
    raise exception 'Expected professional registration validation was not found';
  end if;

  execute replace(v_definition, v_previous_rule, v_required_rule);
end;
$$;

revoke all on function public.register_activity_internal_before_billing(uuid, jsonb)
from public, anon, authenticated, service_role;
