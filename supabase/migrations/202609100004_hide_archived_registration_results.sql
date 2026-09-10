-- Hide preserved registrations when their source activity is archived.

create or replace function public.get_public_registration_result(p_registration_code text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'activity_slug', activities.slug,
    'activity_title', activities.title,
    'activity_type', activities.type,
    'contact_email', activities.contact_email,
    'contact_name', activities.contact_name,
    'contact_phone', activities.contact_phone,
    'is_free', activities.is_free,
    'price_snapshot', registrations.price_snapshot,
    'registration_code', registrations.registration_code,
    'status', registrations.status
  )
  from public.registrations
  join public.activities on activities.id = registrations.activity_id
  where registrations.registration_code = upper(btrim(p_registration_code))
    and registrations.deleted_at is null
    and activities.deleted_at is null
    and activities.status <> 'archived';
$$;

revoke execute on function public.get_public_registration_result(text) from public;
grant execute on function public.get_public_registration_result(text) to anon, authenticated, service_role;

comment on function public.get_public_registration_result(text)
  is 'Devuelve el resultado público no sensible de una inscripción cuya actividad continúa visible.';
