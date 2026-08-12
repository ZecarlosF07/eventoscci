alter function public.register_activity(uuid, jsonb)
rename to register_activity_internal;

revoke execute on function public.register_activity_internal(uuid, jsonb)
from public, anon, authenticated;
grant execute on function public.register_activity_internal(uuid, jsonb)
to service_role;

create or replace function public.register_activity(
  p_activity_id uuid,
  p_registration jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_person_id uuid;
begin
  select id
  into v_person_id
  from public.people
  where document_type::text = lower(btrim(p_registration->>'document_type'))
    and document_number = upper(btrim(p_registration->>'document_number'));

  if v_person_id is not null and exists (
    select 1
    from public.registrations
    where activity_id = p_activity_id
      and person_id = v_person_id
      and deleted_at is null
  ) then
    raise exception 'DUPLICATE_REGISTRATION' using errcode = '23505';
  end if;

  return public.register_activity_internal(p_activity_id, p_registration);
end;
$$;

revoke execute on function public.register_activity(uuid, jsonb) from public;
grant execute on function public.register_activity(uuid, jsonb)
to anon, authenticated, service_role;

comment on function public.register_activity_internal(uuid, jsonb) is 'Implementación interna transaccional; no se expone a clientes.';
comment on function public.register_activity(uuid, jsonb) is 'Punto público idempotente para registrar una actividad.';
