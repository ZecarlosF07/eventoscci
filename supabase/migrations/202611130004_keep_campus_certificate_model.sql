create function public.guard_last_course_certificate_model()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and new.scope = 'course' and new.is_active and new.deleted_at is null then
    return new;
  end if;

  perform pg_advisory_xact_lock(31020, 1);
  if not exists (
    select 1 from public.certificate_templates
    where scope = 'course' and is_active and deleted_at is null and id <> old.id
  ) then
    raise exception 'LAST_ACTIVE_COURSE_TEMPLATE' using errcode = 'P0001';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

-- Both retirement entry points take the same lock as save before locking a row.
do $$
declare
  v_signature regprocedure;
  v_definition text;
  v_anchor text := '  select * into v_old from public.certificate_templates';
begin
  foreach v_signature in array array[
    'public.retire_certificate_template(uuid)'::regprocedure,
    'public.soft_delete_certificate_template(uuid)'::regprocedure
  ] loop
    select pg_get_functiondef(v_signature) into v_definition;
    if strpos(v_definition, v_anchor) = 0 then raise exception 'Incompatible retirement lock: %', v_signature; end if;
    execute replace(v_definition, v_anchor, '  perform pg_advisory_xact_lock(31020, 1);' || chr(10) || v_anchor);
  end loop;
  select pg_get_functiondef('public.check_course_completion(uuid)'::regprocedure) into v_definition;
  v_anchor := '  select template.id into v_template_id';
  if strpos(v_definition, v_anchor) = 0 then raise exception 'Incompatible Campus model selection'; end if;
  execute replace(v_definition, v_anchor, '  perform pg_advisory_xact_lock_shared(31020, 1);' || chr(10) || v_anchor);
end;
$$;

create trigger guard_last_course_certificate_model
before update of scope, is_active, deleted_at or delete on public.certificate_templates
for each row
when (old.scope = 'course' and old.is_active and old.deleted_at is null)
execute function public.guard_last_course_certificate_model();

revoke all on function public.guard_last_course_certificate_model() from public, anon, authenticated, service_role;
