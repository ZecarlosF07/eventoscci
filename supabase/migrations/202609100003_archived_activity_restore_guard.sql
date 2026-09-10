create or replace function public.enforce_archived_activity_restore_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.status = 'archived' and new.status not in ('archived', 'draft') then
    raise exception 'ARCHIVED_RESTORE_REQUIRES_DRAFT' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_archived_activity_restore_transition on public.activities;
create trigger enforce_archived_activity_restore_transition
before update of status on public.activities
for each row execute function public.enforce_archived_activity_restore_transition();
