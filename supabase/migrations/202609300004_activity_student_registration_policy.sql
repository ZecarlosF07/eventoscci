-- Restrict the declared student profile per activity without changing historical registrations.
alter table public.activities
  add column allows_student_registration boolean not null default true;

comment on column public.activities.allows_student_registration is
  'Whether new individual registrations may declare the student profile; independent from members_only.';

alter function public.save_activity(jsonb, jsonb, jsonb)
  rename to save_activity_without_student_policy;
revoke all on function public.save_activity_without_student_policy(jsonb, jsonb, jsonb)
  from public, anon, authenticated, service_role;

create function public.save_activity(p_activity jsonb, p_dates jsonb, p_speakers jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
  v_previous boolean := true;
  v_requested boolean;
begin
  if not public.is_internal_user() then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;
  if p_activity ? 'allows_student_registration' then
    if jsonb_typeof(p_activity->'allows_student_registration') is distinct from 'boolean' then
      raise exception 'INVALID_STUDENT_REGISTRATION_POLICY' using errcode = '22023';
    end if;
    v_requested := (p_activity->>'allows_student_registration')::boolean;
  end if;
  if nullif(p_activity->>'id', '') is not null then
    select allows_student_registration into v_previous from public.activities
      where id = (p_activity->>'id')::uuid for update;
  end if;

  -- Existing wrappers still enforce ownership, dates, commercial rules and complimentary passes.
  v_id := public.save_activity_without_student_policy(p_activity, p_dates, p_speakers);
  if v_requested is not null then
    update public.activities set allows_student_registration = v_requested where id = v_id;
    if v_previous is distinct from v_requested then
      insert into public.audit_logs(actor_user_id, action, entity_type, entity_id, old_data, new_data)
      values (auth.uid(), 'activity.student_registration_policy_changed', 'activity', v_id,
        jsonb_build_object('allows_student_registration', v_previous),
        jsonb_build_object('allows_student_registration', v_requested));
    end if;
  end if;
  return v_id;
end;
$$;
revoke all on function public.save_activity(jsonb, jsonb, jsonb) from public, anon;
grant execute on function public.save_activity(jsonb, jsonb, jsonb) to authenticated, service_role;

-- Add the guard to the existing core, preserving the billing and certificate wrappers.
-- The core holds an activity row lock and reaches this guard before any participant writes.
do $$
declare
  v_definition text;
  v_anchor text := 'if v_participant_profile = ''student'' then';
begin
  select pg_get_functiondef('public.register_activity_internal_before_billing(uuid,jsonb)'::regprocedure)
    into v_definition;
  if (length(v_definition) - length(replace(v_definition, v_anchor, ''))) / length(v_anchor) <> 1 then
    raise exception 'STUDENT_REGISTRATION_POLICY_PATCH_NOT_FOUND';
  end if;
  execute replace(v_definition, v_anchor,
    'if v_participant_profile = ''student'' and not v_activity.allows_student_registration then
    raise exception ''STUDENT_REGISTRATION_NOT_ALLOWED'' using errcode = ''P0001'';
  end if;

  ' || v_anchor);
end;
$$;
revoke all on function public.register_activity_internal_before_billing(uuid, jsonb)
  from public, anon, authenticated, service_role;
