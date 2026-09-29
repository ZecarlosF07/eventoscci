-- A certificate finalized through another authorized path must never keep its batch open.
create function public.sync_certificate_batch_file_ready()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.certificate_type = 'activity' and new.file_path is not null
    and old.file_path is distinct from new.file_path then
    update public.certificate_issue_batch_items set state = 'issued', lease_token = null,
      lease_until = null, last_error = null, updated_at = now()
    where registration_id = new.registration_id and state <> 'issued';
  end if;
  return new;
end;
$$;
create trigger sync_certificate_batch_file_ready
after update of file_path on public.certificates
for each row execute function public.sync_certificate_batch_file_ready();

update public.certificate_issue_batch_items i set state = 'issued', lease_token = null,
  lease_until = null, last_error = null, updated_at = now()
from public.certificates c
where c.registration_id = i.registration_id and c.certificate_type = 'activity'
  and c.file_path is not null and c.deleted_at is null and i.state <> 'issued';

create or replace function public.count_recoverable_activity_certificates(p_activity_id uuid)
returns integer language plpgsql stable security definer set search_path = '' as $$
declare v_count integer;
begin
  if not public.is_active_admin() then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  select count(*) into v_count from public.certificates c
  join public.registrations r on r.id = c.registration_id and r.deleted_at is null
  where r.activity_id = p_activity_id and c.certificate_type = 'activity'
    and c.status = 'issued' and c.file_path is null and c.deleted_at is null
    and (public.activity_certificate_batch_eligible(r.id) or not exists (
      select 1 from public.certificate_issue_batch_items i
      join public.certificate_issue_batches b on b.id = i.batch_id
      where i.registration_id = r.id and b.activity_id = p_activity_id and i.state = 'blocked'
    ));
  return v_count;
end;
$$;
