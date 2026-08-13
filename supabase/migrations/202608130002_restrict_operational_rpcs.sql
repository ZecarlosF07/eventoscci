revoke execute on function public.confirm_registration(uuid) from anon;
revoke execute on function public.cancel_registration(uuid, text) from anon;
revoke execute on function public.update_participant(uuid, jsonb) from anon;
revoke execute on function public.set_attendance_status(uuid[], public.attendance_status, text) from anon;

comment on function public.confirm_registration(uuid) is
  'Confirma idempotentemente una preinscripción; acceso solo para roles autenticados autorizados.';
