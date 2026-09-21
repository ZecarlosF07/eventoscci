-- Preserve missed reminders as history without sending them after the session starts.

create or replace function public.cancel_expired_virtual_reminders()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cancelled integer;
begin
  update public.notification_outbox notification
  set
    status = 'cancelled',
    next_attempt_at = null,
    last_error = 'Recordatorio omitido porque la sesión ya comenzó.'
  from public.activity_virtual_reminders reminder
  where notification.event_type = 'activity_virtual_session_reminder'
    and notification.related_entity_type = 'activity_virtual_reminder'
    and notification.related_entity_id = reminder.id
    and notification.deleted_at is null
    and reminder.session_starts_at <= now()
    and (
      notification.status in ('pending', 'failed')
      or (
        notification.status = 'processing'
        and notification.updated_at <= now() - interval '15 minutes'
      )
    );

  get diagnostics v_cancelled = row_count;
  return v_cancelled;
end;
$$;

revoke execute on function public.cancel_expired_virtual_reminders()
from public, anon, authenticated;
grant execute on function public.cancel_expired_virtual_reminders() to service_role;

comment on function public.cancel_expired_virtual_reminders() is
  'Cancels unsent virtual reminders once their session has started, preserving their history.';

select public.cancel_expired_virtual_reminders();
