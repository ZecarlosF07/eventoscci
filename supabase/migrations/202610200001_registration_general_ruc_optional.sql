-- General professionals may omit RUC. Member identification, company, billing,
-- pricing, certificate and notification wrappers retain their existing rules.
do $$
declare
  v_core regprocedure;
  v_definition text;
  v_required_rule text := 'if v_participant_profile = ''professional'' and (v_company is null or length(v_company) < 2 or v_ruc is null) then';
  v_optional_rule text := 'if v_participant_profile = ''professional'' and (v_company is null or length(v_company) < 2) then';
begin
  foreach v_core in array array[
    'public.register_activity_internal_before_billing(uuid,jsonb)'::regprocedure,
    'public.register_activity_priced(uuid,jsonb,numeric)'::regprocedure
  ] loop
    select pg_get_functiondef(v_core) into v_definition;
    if strpos(v_definition, v_required_rule) = 0 then
      raise exception 'Expected professional RUC validation was not found in %', v_core;
    end if;
    execute replace(v_definition, v_required_rule, v_optional_rule);
  end loop;
end;
$$;

revoke all on function public.register_activity_internal_before_billing(uuid,jsonb) from public,anon,authenticated,service_role;
revoke all on function public.register_activity_priced(uuid,jsonb,numeric) from public,anon,authenticated,service_role;
