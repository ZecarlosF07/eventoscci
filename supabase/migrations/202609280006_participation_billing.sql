-- Additive rollout: new clients submit billing, legacy clients remain compatible
-- until supabase/rollouts/enable_registration_billing.sql is explicitly applied.
create table public.registration_billing_details (
  registration_id uuid primary key references public.registrations(id) on delete restrict,
  billing_type text not null check (billing_type in ('boleta', 'factura')),
  billing_document text not null,
  billing_name text not null check (length(btrim(billing_name)) between 2 and 250),
  billing_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint registration_billing_values_check check (
    (billing_type = 'boleta' and billing_document ~ '^[0-9]{8}$' and billing_address is null)
    or (billing_type = 'factura' and billing_document ~ '^[0-9]{11}$'
      and coalesce(length(btrim(billing_address)) between 2 and 250, false))
  )
);
create trigger set_registration_billing_updated_at before update on public.registration_billing_details
for each row execute function public.set_updated_at();
alter table public.registration_billing_details enable row level security;
revoke all on public.registration_billing_details from public, anon, authenticated;
grant select on public.registration_billing_details to authenticated;
grant all on public.registration_billing_details to service_role;
create policy registration_billing_internal_read on public.registration_billing_details
for select to authenticated using ((select public.is_internal_user()));

create function public.registration_billing_enforced()
returns boolean language sql stable set search_path = '' as $$ select false $$;
revoke all on function public.registration_billing_enforced() from public, anon, authenticated;

create function public.normalize_participation_billing(p_billing jsonb)
returns jsonb language plpgsql immutable set search_path = '' as $$
declare
  v_type text := p_billing->>'type';
  v_document text := btrim(p_billing->>'document');
  v_name text := btrim(p_billing->>'name');
  v_address text := nullif(btrim(p_billing->>'address'), '');
begin
  if jsonb_typeof(p_billing) is distinct from 'object'
    or v_type is null or v_type not in ('boleta','factura')
    or jsonb_typeof(p_billing->'document') is distinct from 'string'
    or jsonb_typeof(p_billing->'name') is distinct from 'string'
    or v_name is null or length(v_name) not between 2 and 250
    or (v_type = 'boleta' and v_document !~ '^[0-9]{8}$')
    or (v_type = 'factura' and (v_document !~ '^[0-9]{11}$'
      or jsonb_typeof(p_billing->'address') is distinct from 'string'
      or v_address is null or length(v_address) not between 2 and 250))
  then raise exception 'INVALID_BILLING_DATA' using errcode = '22023'; end if;
  return jsonb_build_object('type',v_type,'document',v_document,'name',v_name,
    'address',case when v_type='factura' then v_address else null end);
end $$;
revoke all on function public.normalize_participation_billing(jsonb) from public, anon, authenticated;

alter function public.register_activity_internal(uuid,jsonb) rename to register_activity_internal_before_billing;
revoke all on function public.register_activity_internal_before_billing(uuid,jsonb)
from public, anon, authenticated, service_role;
create function public.register_activity_internal(p_activity_id uuid,p_registration jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_activity public.activities%rowtype;
  v_price numeric;
  v_billing jsonb;
  v_result jsonb;
begin
  select * into v_activity from public.activities where id=p_activity_id for update;
  v_price := case when v_activity.is_free then 0 when p_registration->>'registration_type'='member'
    then v_activity.member_price else v_activity.general_price end;
  if v_price > 0 then
    if p_registration->'billing' is not null and p_registration->'billing' <> 'null'::jsonb then
      v_billing := public.normalize_participation_billing(p_registration->'billing');
    elsif p_registration ? 'billing' or public.registration_billing_enforced() then
      raise exception 'BILLING_REQUIRED' using errcode = '22023';
    end if;
  end if;
  v_result := public.register_activity_internal_before_billing(p_activity_id,p_registration);
  if (v_result->>'price_snapshot')::numeric > 0 and v_billing is not null then
    insert into public.registration_billing_details(registration_id,billing_type,billing_document,billing_name,billing_address)
    values ((v_result->>'registration_id')::uuid,v_billing->>'type',v_billing->>'document',
      v_billing->>'name',v_billing->>'address');
  end if;
  return v_result;
end $$;
revoke all on function public.register_activity_internal(uuid,jsonb) from public, anon, authenticated, service_role;

create function public.guard_registration_billing()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_registration public.registrations%rowtype;
begin
  if tg_table_name='registrations' then
    select * into v_registration from public.registrations where id=new.id;
  else
    select * into v_registration from public.registrations
    where id=case when tg_op='DELETE' then old.registration_id else new.registration_id end;
  end if;
  if v_registration.member_group_request_id is null and v_registration.price_snapshot > 0
    and v_registration.deleted_at is null and public.registration_billing_enforced()
    and not exists(select 1 from public.registration_billing_details where registration_id=v_registration.id)
  then raise exception 'BILLING_REQUIRED' using errcode = '22023'; end if;
  if tg_table_name='registration_billing_details' and tg_op <> 'DELETE'
    and (v_registration.member_group_request_id is not null or v_registration.price_snapshot <= 0)
  then raise exception 'BILLING_NOT_APPLICABLE' using errcode = '22023'; end if;
  return null;
end $$;
create constraint trigger require_new_registration_billing
after insert on public.registrations deferrable initially deferred
for each row execute function public.guard_registration_billing();
create constraint trigger protect_registration_billing_details
after insert or update or delete on public.registration_billing_details deferrable initially deferred
for each row execute function public.guard_registration_billing();
revoke all on function public.guard_registration_billing() from public, anon, authenticated;

create view public.participation_billing_requests with (security_invoker=true) as
with totals as (
  select coalesce(r.member_group_request_id,r.id) as id,
    sum(r.price_snapshot) as participation_amount,
    string_agg(concat_ws(' ',r.registration_code,r.first_names_snapshot,r.last_names_snapshot,
      p.document_number,p.first_names,p.last_names),' ') as attendee_search
  from public.registrations r join public.people p on p.id=r.person_id and p.deleted_at is null
  where r.deleted_at is null group by coalesce(r.member_group_request_id,r.id)
)
select pr.id,pr.activity_id,pr.kind,pr.code,pr.name,pr.company_ruc,
  coalesce(g.company_name_snapshot,r.company_snapshot) as company_name,
  coalesce(pr.company_ruc,'sin-empresa') as company_key,
  pr.created_at,pr.status,pr.seat_count,pr.pending_count,pr.pending_amount,
  pr.validated_amount,pr.legacy_amount,pr.complimentary_count,t.participation_amount,
  coalesce(g.billing_type,b.billing_type) as billing_type,
  coalesce(g.billing_document,b.billing_document) as billing_document,
  coalesce(g.billing_name,b.billing_name) as billing_name,
  coalesce(g.billing_address,b.billing_address) as billing_address,
  case when coalesce(g.billing_type,b.billing_type) is not null then 'provided'
    when t.participation_amount > 0 then 'missing' else 'not_required' end as billing_state,
  concat_ws(' ',pr.search_text,t.attendee_search,coalesce(g.billing_document,b.billing_document),
    coalesce(g.billing_name,b.billing_name),coalesce(g.company_name_snapshot,r.company_snapshot)) as search_text
from public.participation_payment_requests pr
join totals t on t.id=pr.id
join public.activities a on a.id=pr.activity_id
left join public.member_group_requests g on g.id=pr.id and pr.kind='group'
left join public.registrations r on r.id=pr.id and pr.kind='individual'
left join public.registration_billing_details b on b.registration_id=r.id
where not a.is_free or t.participation_amount>0 or coalesce(g.billing_type,b.billing_type) is not null;
revoke all on public.participation_billing_requests from public, anon;
grant select on public.participation_billing_requests to authenticated, service_role;

create function public.get_participation_billing_companies(
 p_activity_id uuid,p_query text default '',p_billing_type text default 'all',
 p_state text default 'all',p_limit integer default 20,p_offset integer default 0)
returns table(company_key text,company_ruc text,company_name text,request_count bigint,
 participation_amount numeric,validated_amount numeric,pending_amount numeric,total_count bigint)
language plpgsql stable security invoker set search_path='' as $$
begin
  if not public.is_internal_user() then raise exception 'UNAUTHORIZED' using errcode='42501'; end if;
  if p_activity_id is null or p_query is null or length(p_query)>150
    or p_billing_type is null or p_billing_type not in ('all','boleta','factura','missing','not_required')
    or p_state is null or p_state not in ('all','pending','partial','complete','cancelled')
    or p_limit is null or p_limit<>20 or p_offset is null or p_offset<0
  then raise exception 'VALIDATION_ERROR' using errcode='22023'; end if;
  return query select b.company_key,max(b.company_ruc),max(b.company_name),count(*),
    sum(b.participation_amount),sum(b.validated_amount),sum(b.pending_amount),count(*) over()
  from public.participation_billing_requests b where b.activity_id=p_activity_id
    and (p_query='' or b.search_text ilike public.admin_literal_pattern(p_query))
    and (p_state='all' or b.status=p_state)
    and (p_billing_type='all' or b.billing_type=p_billing_type or b.billing_state=p_billing_type)
  group by b.company_key order by b.company_key limit p_limit offset p_offset;
end $$;
revoke all on function public.get_participation_billing_companies(uuid,text,text,text,integer,integer) from public, anon;
grant execute on function public.get_participation_billing_companies(uuid,text,text,text,integer,integer) to authenticated,service_role;

create function public.correct_participation_billing(p_kind text,p_request_id uuid,p_billing jsonb,p_reason text)
returns void language plpgsql security definer set search_path='' as $$
declare
 v_old public.registration_billing_details%rowtype;
 v_billing jsonb;
begin
  if not public.is_internal_user() then raise exception 'UNAUTHORIZED' using errcode='42501'; end if;
  if p_kind is null or p_kind not in ('group','individual') or p_request_id is null
    or p_reason is null or length(btrim(p_reason)) not between 2 and 500
  then raise exception 'VALIDATION_ERROR' using errcode='22023'; end if;
  v_billing := public.normalize_participation_billing(p_billing);
  if p_kind='group' then
    perform public.correct_member_group_billing(p_request_id,v_billing,btrim(p_reason));
    return;
  end if;
  select b.* into v_old from public.registration_billing_details b
  join public.registrations r on r.id=b.registration_id and r.deleted_at is null
  join public.people p on p.id=r.person_id and p.deleted_at is null
  join public.activities a on a.id=r.activity_id and a.deleted_at is null and a.status<>'archived'
  where b.registration_id=p_request_id for update of b;
  if not found then raise exception 'BILLING_DETAILS_NOT_FOUND' using errcode='P0001'; end if;
  update public.registration_billing_details set billing_type=v_billing->>'type',
    billing_document=v_billing->>'document',billing_name=v_billing->>'name',billing_address=v_billing->>'address'
  where registration_id=p_request_id;
  insert into public.audit_logs(actor_user_id,action,entity_type,entity_id,old_data,new_data,metadata)
  values(auth.uid(),'registration.billing_corrected','registration',p_request_id,to_jsonb(v_old),v_billing,
    jsonb_build_object('reason',btrim(p_reason)));
end $$;
revoke all on function public.correct_participation_billing(text,uuid,jsonb,text) from public,anon;
grant execute on function public.correct_participation_billing(text,uuid,jsonb,text) to authenticated,service_role;
