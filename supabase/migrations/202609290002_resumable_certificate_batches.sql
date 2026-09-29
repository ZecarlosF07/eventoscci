create table public.certificate_issue_batches (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id),
  template_id uuid not null references public.certificate_templates(id),
  condition text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  constraint certificate_batch_condition_valid check (length(btrim(condition)) between 1 and 120)
);

create table public.certificate_issue_batch_items (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.certificate_issue_batches(id),
  registration_id uuid not null references public.registrations(id),
  state text not null default 'pending' check (state in ('pending', 'processing', 'issued', 'failed', 'blocked')),
  lease_token uuid,
  lease_until timestamptz,
  attempts integer not null default 0 check (attempts >= 0),
  last_error text,
  updated_at timestamptz not null default now(),
  unique (batch_id, registration_id),
  constraint certificate_batch_lease_consistent check (
    (state = 'processing') = (lease_token is not null and lease_until is not null)
  )
);

create index certificate_batch_activity_latest on public.certificate_issue_batches(activity_id, created_at desc);
create index certificate_batch_items_state on public.certificate_issue_batch_items(batch_id, state);
alter table public.certificate_issue_batches enable row level security;
alter table public.certificate_issue_batch_items enable row level security;
revoke all on public.certificate_issue_batches, public.certificate_issue_batch_items from public, anon, authenticated;

create function public.activity_certificate_batch_eligible(p_registration_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.registrations r
    join public.activities a on a.id = r.activity_id and a.deleted_at is null and a.status <> 'archived'
    join public.people p on p.id = r.person_id and p.deleted_at is null
    join public.attendance t on t.registration_id = r.id and t.deleted_at is null
    where r.id = p_registration_id and r.deleted_at is null
      and r.status = 'confirmed' and t.status = 'attended'
      and a.certificate_mode <> 'none'
      and (a.certificate_mode = 'included' or r.certificate_mode_snapshot = 'included'
        or (r.certificate_mode_snapshot = 'optional_paid'
          and r.certificate_requested_at is not null
          and r.certificate_payment_verified_at is not null))
      and not exists (
        select 1 from public.certificates c where c.registration_id = r.id
          and c.certificate_type = 'activity' and c.deleted_at is null and c.status = 'revoked'
      )
  );
$$;

create function public.get_activity_certificate_batch(p_activity_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_batch public.certificate_issue_batches%rowtype;
begin
  if not public.is_active_admin() then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  select * into v_batch from public.certificate_issue_batches
  where activity_id = p_activity_id order by created_at desc, id desc limit 1;
  if not found then return null; end if;
  return (
    select jsonb_build_object(
      'id', v_batch.id, 'activity_id', v_batch.activity_id,
      'created_at', v_batch.created_at, 'total', count(*),
      'issued', count(*) filter (where i.state = 'issued' or c.file_path is not null),
      'pending', count(*) filter (where i.state = 'pending' and c.file_path is null),
      'processing', count(*) filter (where i.state = 'processing' and c.file_path is null and i.lease_until > now()),
      'recoverable', count(*) filter (where i.state in ('failed', 'processing') and c.file_path is null
        and (i.state = 'failed' or i.lease_until <= now())),
      'blocked', count(*) filter (where i.state = 'blocked' and c.file_path is null),
      'errors', coalesce(jsonb_agg(jsonb_build_object('registration_id', i.registration_id, 'reason', i.last_error))
        filter (where i.state in ('failed', 'blocked') and c.file_path is null), '[]'::jsonb),
      'email_attention', count(*) filter (where c.file_path is not null and n.status in ('pending', 'failed', 'processing'))
    )
    from public.certificate_issue_batch_items i
    left join public.certificates c on c.registration_id = i.registration_id
      and c.certificate_type = 'activity' and c.deleted_at is null
    left join public.notification_outbox n on n.related_entity_id = c.id
      and n.related_entity_type = 'certificate' and n.event_type = 'activity_certificate_issued' and n.deleted_at is null
    where i.batch_id = v_batch.id
  );
end;
$$;

create function public.count_recoverable_activity_certificates(p_activity_id uuid)
returns integer language plpgsql stable security definer set search_path = '' as $$
declare v_count integer;
begin
  if not public.is_active_admin() then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  select count(*) into v_count from public.certificates c
  join public.registrations r on r.id = c.registration_id and r.deleted_at is null
  where r.activity_id = p_activity_id and c.certificate_type = 'activity'
    and c.status = 'issued' and c.file_path is null and c.deleted_at is null;
  return v_count;
end;
$$;

create function public.start_activity_certificate_batch(
  p_activity_id uuid, p_template_id uuid, p_condition text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_batch_id uuid; v_count integer;
begin
  if not public.is_active_admin() then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  if p_activity_id is null or p_template_id is null or nullif(btrim(p_condition), '') is null
    or length(btrim(p_condition)) > 120 then raise exception 'VALIDATION_ERROR' using errcode = '22023'; end if;
  if not exists (select 1 from public.activities where id = p_activity_id and status <> 'archived' and deleted_at is null)
    or not exists (select 1 from public.certificate_templates
      where id = p_template_id and scope = 'activity' and is_active and deleted_at is null)
  then raise exception 'NOT_AVAILABLE' using errcode = 'P0001'; end if;
  perform pg_advisory_xact_lock(hashtext(p_activity_id::text), 31029);
  select b.id into v_batch_id from public.certificate_issue_batches b
  where b.activity_id = p_activity_id and exists (
    select 1 from public.certificate_issue_batch_items i
    where i.batch_id = b.id and i.state in ('pending', 'processing', 'failed')
  ) order by b.created_at limit 1;
  if found then return v_batch_id; end if;

  insert into public.certificate_issue_batches (activity_id, template_id, condition, created_by)
  values (p_activity_id, p_template_id, btrim(p_condition), auth.uid()) returning id into v_batch_id;
  insert into public.certificate_issue_batch_items (batch_id, registration_id)
  select v_batch_id, candidate.id from (
    select r.id, case when c.id is not null then 0 else 1 end as priority, r.created_at
    from public.registrations r
    left join public.certificates c on c.registration_id = r.id and c.certificate_type = 'activity' and c.deleted_at is null
    where r.activity_id = p_activity_id and r.deleted_at is null
      and ((c.id is null and public.activity_certificate_batch_eligible(r.id))
        or (c.file_path is null and c.status = 'issued'))
      and (public.activity_certificate_batch_eligible(r.id) or not exists (
        select 1 from public.certificate_issue_batch_items prior
        join public.certificate_issue_batches pb on pb.id = prior.batch_id
        where prior.registration_id = r.id and pb.activity_id = p_activity_id and prior.state = 'blocked'
      ))
    order by priority, r.created_at, r.id limit 20
  ) candidate;
  get diagnostics v_count = row_count;
  if v_count = 0 then
    delete from public.certificate_issue_batches where id = v_batch_id;
    return null;
  end if;
  return v_batch_id;
end;
$$;

create function public.claim_activity_certificate_batch_item(p_batch_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_batch public.certificate_issue_batches%rowtype;
  v_item public.certificate_issue_batch_items%rowtype;
  v_token uuid := gen_random_uuid();
begin
  if not public.is_active_admin() then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  select * into v_batch from public.certificate_issue_batches where id = p_batch_id for update;
  if not found then raise exception 'BATCH_NOT_FOUND' using errcode = 'P0001'; end if;
  if exists (select 1 from public.certificate_issue_batch_items
    where batch_id = p_batch_id and state = 'processing' and lease_until > now()) then return null; end if;
  select * into v_item from public.certificate_issue_batch_items
  where batch_id = p_batch_id and (state in ('pending', 'failed')
    or (state = 'processing' and lease_until <= now()))
  order by case state when 'pending' then 0 else 1 end, updated_at, id limit 1 for update;
  if not found then return null; end if;
  update public.certificate_issue_batch_items set state = 'processing', lease_token = v_token,
    lease_until = now() + interval '2 minutes', attempts = attempts + 1,
    last_error = null, updated_at = now() where id = v_item.id;
  return jsonb_build_object('item_id', v_item.id, 'registration_id', v_item.registration_id,
    'lease_token', v_token, 'template_id', v_batch.template_id, 'condition', v_batch.condition,
    'eligible', public.activity_certificate_batch_eligible(v_item.registration_id));
end;
$$;

create function public.finish_activity_certificate_batch_item(
  p_item_id uuid, p_lease_token uuid, p_state text, p_error text default null
) returns boolean language plpgsql security definer set search_path = '' as $$
declare v_item public.certificate_issue_batch_items%rowtype;
begin
  if not public.is_active_admin() then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  if p_state not in ('issued', 'failed', 'blocked') then raise exception 'VALIDATION_ERROR' using errcode = '22023'; end if;
  select * into v_item from public.certificate_issue_batch_items where id = p_item_id for update;
  if not found or v_item.state <> 'processing' or v_item.lease_token <> p_lease_token
    or v_item.lease_until <= now() then return false; end if;
  if p_state = 'issued' and not exists (select 1 from public.certificates c
    where c.registration_id = v_item.registration_id and c.certificate_type = 'activity'
      and c.status = 'issued' and c.file_path is not null and c.deleted_at is null)
  then raise exception 'CERTIFICATE_NOT_READY' using errcode = 'P0001'; end if;
  update public.certificate_issue_batch_items set state = p_state, lease_token = null,
    lease_until = null, last_error = left(p_error, 500), updated_at = now() where id = p_item_id;
  return true;
end;
$$;

create function public.finalize_activity_certificate_batch_item(
  p_item_id uuid, p_lease_token uuid, p_certificate_id uuid,
  p_file_path text, p_public_base_url text
) returns boolean language plpgsql security definer set search_path = '' as $$
declare v_item public.certificate_issue_batch_items%rowtype;
begin
  if not public.is_active_admin() then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  select * into v_item from public.certificate_issue_batch_items where id = p_item_id for update;
  if not found or v_item.state <> 'processing' or v_item.lease_token <> p_lease_token
    or v_item.lease_until <= now() then return false; end if;
  if not public.activity_certificate_batch_eligible(v_item.registration_id)
    or not exists (select 1 from public.certificates c where c.id = p_certificate_id
      and c.registration_id = v_item.registration_id and c.certificate_type = 'activity'
      and c.status = 'issued' and c.deleted_at is null)
    or p_file_path <> ('issued/' || p_certificate_id::text || '/' || p_lease_token::text || '.pdf')
  then raise exception 'CERTIFICATE_NOT_ELIGIBLE' using errcode = 'P0001'; end if;
  perform public.finalize_activity_certificate(p_certificate_id, p_file_path, p_public_base_url);
  update public.certificate_issue_batch_items set state = 'issued', lease_token = null,
    lease_until = null, updated_at = now() where id = p_item_id;
  return true;
end;
$$;

revoke all on function public.activity_certificate_batch_eligible(uuid) from public, anon, authenticated;
revoke all on function public.get_activity_certificate_batch(uuid) from public, anon;
revoke all on function public.count_recoverable_activity_certificates(uuid) from public, anon;
revoke all on function public.start_activity_certificate_batch(uuid,uuid,text) from public, anon;
revoke all on function public.claim_activity_certificate_batch_item(uuid) from public, anon;
revoke all on function public.finish_activity_certificate_batch_item(uuid,uuid,text,text) from public, anon;
revoke all on function public.finalize_activity_certificate_batch_item(uuid,uuid,uuid,text,text) from public, anon;
grant execute on function public.get_activity_certificate_batch(uuid) to authenticated, service_role;
grant execute on function public.count_recoverable_activity_certificates(uuid) to authenticated, service_role;
grant execute on function public.start_activity_certificate_batch(uuid,uuid,text) to authenticated, service_role;
grant execute on function public.claim_activity_certificate_batch_item(uuid) to authenticated, service_role;
grant execute on function public.finish_activity_certificate_batch_item(uuid,uuid,text,text) to authenticated, service_role;
grant execute on function public.finalize_activity_certificate_batch_item(uuid,uuid,uuid,text,text) to authenticated, service_role;
