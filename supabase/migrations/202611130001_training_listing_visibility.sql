-- Listing visibility is independent of access by link for events and trainings.
alter table public.activities drop constraint activities_unlisted_events_only;

-- Preserve the saved visibility when an older API client omits the field.
-- New rows still use the existing default (true).
do $$
declare
  v_definition text;
  v_old text := 'set is_listed = coalesce((p_activity->>''is_listed'')::boolean, true),';
  v_new text := 'set is_listed = coalesce((p_activity->>''is_listed'')::boolean, is_listed),';
begin
  select pg_get_functiondef('public.save_activity_without_passes(jsonb,jsonb,jsonb)'::regprocedure)
  into v_definition;
  if strpos(v_definition, v_old) = 0 then
    raise exception 'Expected activity listing assignment was not found';
  end if;
  execute replace(v_definition, v_old, v_new);
end $$;

revoke all on function public.save_activity_without_passes(jsonb,jsonb,jsonb)
from public, anon, authenticated, service_role;
