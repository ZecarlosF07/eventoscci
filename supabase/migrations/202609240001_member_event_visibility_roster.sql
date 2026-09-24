-- Hito 15: non-listed events and an atomically replaceable member-company roster.

alter table public.activities
  add column is_listed boolean not null default true;

alter table public.activities
  add constraint activities_unlisted_events_only check (type = 'event' or is_listed) not valid,
  add constraint activities_exclusive_paid_member_price check (
    not (type = 'event' and members_only and status = 'published' and not is_free)
    or member_price > 0
  ) not valid;

alter function public.save_activity(jsonb, jsonb, jsonb)
  rename to save_activity_without_listing;

revoke execute on function public.save_activity_without_listing(jsonb, jsonb, jsonb)
  from public, anon, authenticated, service_role;

create or replace function public.save_activity(
  p_activity jsonb,
  p_dates jsonb,
  p_speakers jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_activity_id uuid;
begin
  if not public.is_internal_user() then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;

  v_activity_id := public.save_activity_without_listing(p_activity, p_dates, p_speakers);
  update public.activities
  set is_listed = coalesce((p_activity->>'is_listed')::boolean, true)
  where id = v_activity_id;
  return v_activity_id;
end;
$$;

revoke execute on function public.save_activity(jsonb, jsonb, jsonb) from public, anon;
grant execute on function public.save_activity(jsonb, jsonb, jsonb)
  to authenticated, service_role;

create table public.member_roster_state (
  singleton boolean primary key default true check (singleton),
  version bigint not null default 0 check (version >= 0),
  updated_at timestamptz not null default now()
);
insert into public.member_roster_state(singleton) values (true);

create table public.member_roster_imports (
  id uuid primary key default extensions.gen_random_uuid(),
  file_name text not null,
  file_hash text not null,
  base_version bigint not null,
  rows_json jsonb not null,
  row_count integer not null,
  added_count integer not null,
  changed_count integer not null,
  removed_count integer not null,
  status text not null default 'previewed' check (status in ('previewed', 'applied')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  applied_at timestamptz,
  constraint member_roster_imports_nonempty check (row_count > 0),
  constraint member_roster_imports_rows_array check (jsonb_typeof(rows_json) = 'array')
);

create table public.member_companies (
  ruc text primary key check (ruc ~ '^[0-9]{11}$'),
  legal_name text not null check (length(btrim(legal_name)) between 2 and 250),
  is_active boolean not null default true,
  import_id uuid references public.member_roster_imports(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_member_companies_active on public.member_companies(ruc) where is_active;
create trigger set_member_companies_updated_at before update on public.member_companies
  for each row execute function public.set_updated_at();

alter table public.member_roster_state enable row level security;
alter table public.member_roster_imports enable row level security;
alter table public.member_companies enable row level security;
revoke all on public.member_roster_state, public.member_roster_imports, public.member_companies
  from public, anon, authenticated;
grant select on public.member_roster_state, public.member_roster_imports, public.member_companies
  to authenticated;
grant all on public.member_roster_state, public.member_roster_imports, public.member_companies
  to service_role;

create policy member_roster_state_internal_read on public.member_roster_state
  for select to authenticated using ((select public.is_internal_user()));
create policy member_roster_imports_admin_read on public.member_roster_imports
  for select to authenticated using ((select public.is_administrator()));
create policy member_companies_internal_read on public.member_companies
  for select to authenticated using ((select public.is_internal_user()));

create or replace function public.lookup_active_member_company(p_ruc text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object('ruc', company.ruc, 'legal_name', company.legal_name)
  from public.member_companies company
  where company.ruc = p_ruc
    and p_ruc ~ '^[0-9]{11}$'
    and company.is_active;
$$;

-- Public calls must pass through the server's exact-lookup rate limiter.
revoke execute on function public.lookup_active_member_company(text)
  from public, anon, authenticated;
grant execute on function public.lookup_active_member_company(text) to service_role;

create or replace function public.preview_member_roster_import(
  p_file_name text,
  p_file_hash text,
  p_rows jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_added integer;
  v_changed integer;
  v_count integer;
  v_id uuid;
  v_removed integer;
  v_version bigint;
begin
  if not public.is_administrator() then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;
  if p_file_name is null or length(btrim(p_file_name)) not between 1 and 200
    or p_file_hash !~ '^[a-f0-9]{64}$'
    or jsonb_typeof(p_rows) <> 'array'
    or jsonb_array_length(p_rows) = 0
    or jsonb_array_length(p_rows) > 100000
  then
    raise exception 'INVALID_ROSTER' using errcode = '22023';
  end if;

  select count(*) into v_count from jsonb_array_elements(p_rows) as item(value)
  where (item.value->>'ruc') !~ '^[0-9]{11}$'
    or length(btrim(coalesce(item.value->>'legal_name', ''))) not between 2 and 250;
  if v_count > 0 then
    raise exception 'INVALID_ROSTER' using errcode = '22023';
  end if;

  select count(*) - count(distinct item.value->>'ruc') into v_count
  from jsonb_array_elements(p_rows) as item(value);
  if v_count > 0 then
    raise exception 'DUPLICATE_RUC' using errcode = '23505';
  end if;

  select version into v_version from public.member_roster_state where singleton;

  select count(*) filter (where company.ruc is null),
    count(*) filter (where company.ruc is not null and (
      not company.is_active or company.legal_name <> btrim(item.value->>'legal_name')
    ))
  into v_added, v_changed
  from jsonb_array_elements(p_rows) as item(value)
  left join public.member_companies company on company.ruc = item.value->>'ruc';

  select count(*) into v_removed from public.member_companies company
  where company.is_active
    and not exists (
      select 1 from jsonb_array_elements(p_rows) as item(value)
      where item.value->>'ruc' = company.ruc
    );

  insert into public.member_roster_imports(
    file_name, file_hash, base_version, rows_json, row_count,
    added_count, changed_count, removed_count, created_by
  ) values (
    btrim(p_file_name), p_file_hash, v_version, p_rows,
    jsonb_array_length(p_rows), v_added, v_changed, v_removed, auth.uid()
  ) returning id into v_id;

  return jsonb_build_object(
    'id', v_id, 'base_version', v_version, 'row_count', jsonb_array_length(p_rows),
    'added_count', v_added, 'changed_count', v_changed, 'removed_count', v_removed
  );
end;
$$;

create or replace function public.apply_member_roster_import(p_import_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_import public.member_roster_imports%rowtype;
  v_item jsonb;
  v_version bigint;
begin
  if not public.is_administrator() then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;

  select version into v_version from public.member_roster_state where singleton for update;
  select * into v_import from public.member_roster_imports
  where id = p_import_id for update;
  if not found or v_import.status <> 'previewed' then
    raise exception 'IMPORT_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_import.base_version <> v_version then
    raise exception 'ROSTER_PREVIEW_STALE' using errcode = 'P0001';
  end if;

  update public.member_companies company set is_active = false
  where company.is_active and not exists (
    select 1 from jsonb_array_elements(v_import.rows_json) as item(value)
    where item.value->>'ruc' = company.ruc
  );

  for v_item in select value from jsonb_array_elements(v_import.rows_json) loop
    insert into public.member_companies(ruc, legal_name, is_active, import_id)
    values (v_item->>'ruc', btrim(v_item->>'legal_name'), true, v_import.id)
    on conflict (ruc) do update set
      legal_name = excluded.legal_name,
      is_active = true,
      import_id = excluded.import_id;
  end loop;

  update public.member_roster_imports set status = 'applied', applied_at = now()
  where id = v_import.id;
  update public.member_roster_state set version = version + 1, updated_at = now()
  where singleton;

  insert into public.audit_logs(actor_user_id, action, entity_type, entity_id, new_data)
  values (auth.uid(), 'member_roster.replaced', 'member_roster_import', v_import.id,
    jsonb_build_object('row_count', v_import.row_count, 'added', v_import.added_count,
      'changed', v_import.changed_count, 'removed', v_import.removed_count));

  return jsonb_build_object('id', v_import.id, 'version', v_version + 1,
    'row_count', v_import.row_count);
end;
$$;

revoke execute on function public.preview_member_roster_import(text, text, jsonb),
  public.apply_member_roster_import(uuid) from public, anon;
grant execute on function public.preview_member_roster_import(text, text, jsonb),
  public.apply_member_roster_import(uuid) to authenticated, service_role;

create table public.member_roster_lookup_limits (
  bucket_hash text primary key,
  window_started_at timestamptz not null default now(),
  attempts integer not null default 0 check (attempts >= 0)
);
alter table public.member_roster_lookup_limits enable row level security;
revoke all on public.member_roster_lookup_limits from public, anon, authenticated;
grant all on public.member_roster_lookup_limits to service_role;

create or replace function public.lookup_active_member_company_limited(
  p_ruc text,
  p_bucket_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempts integer;
begin
  if auth.role() <> 'service_role' then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;
  if p_ruc !~ '^[0-9]{11}$' or p_bucket_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'VALIDATION_ERROR' using errcode = '22023';
  end if;

  insert into public.member_roster_lookup_limits(bucket_hash, attempts)
  values (p_bucket_hash, 1)
  on conflict (bucket_hash) do update set
    window_started_at = case
      when member_roster_lookup_limits.window_started_at < now() - interval '1 minute'
        then now() else member_roster_lookup_limits.window_started_at end,
    attempts = case
      when member_roster_lookup_limits.window_started_at < now() - interval '1 minute'
        then 1 else member_roster_lookup_limits.attempts + 1 end
  returning attempts into v_attempts;
  if v_attempts > 12 then
    raise exception 'LOOKUP_RATE_LIMITED' using errcode = 'P0001';
  end if;
  return public.lookup_active_member_company(p_ruc);
end;
$$;

revoke execute on function public.lookup_active_member_company_limited(text, text)
  from public, anon, authenticated;
grant execute on function public.lookup_active_member_company_limited(text, text)
  to service_role;
