-- Normalize the price selector exactly as the historical registration function does.
create or replace function public.register_activity_internal(p_activity_id uuid,p_registration jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_activity public.activities%rowtype;
  v_price numeric;
  v_billing jsonb;
  v_result jsonb;
begin
  select * into v_activity from public.activities where id=p_activity_id for update;
  v_price := case when v_activity.is_free then 0 when lower(btrim(p_registration->>'registration_type'))='member'
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

-- A courtesy confirmation is not a partial monetary payment.
create or replace view public.participation_billing_requests with (security_invoker=true) as
with totals as (
  select coalesce(r.member_group_request_id,r.id) as id,sum(r.price_snapshot) as participation_amount,
    string_agg(concat_ws(' ',r.registration_code,r.first_names_snapshot,r.last_names_snapshot,
      p.document_number,p.first_names,p.last_names),' ') as attendee_search
  from public.registrations r join public.people p on p.id=r.person_id and p.deleted_at is null
  where r.deleted_at is null group by coalesce(r.member_group_request_id,r.id)
)
select pr.id,pr.activity_id,pr.kind,pr.code,pr.name,pr.company_ruc,
  coalesce(g.company_name_snapshot,r.company_snapshot) as company_name,
  coalesce(pr.company_ruc,'sin-empresa') as company_key,pr.created_at,
  case when pr.status='cancelled' then 'cancelled' when pr.pending_amount>0
    then case when pr.validated_amount>0 then 'partial' else 'pending' end else 'complete' end as status,
  pr.seat_count,pr.pending_count,pr.pending_amount,pr.validated_amount,pr.legacy_amount,
  pr.complimentary_count,t.participation_amount,
  coalesce(g.billing_type,b.billing_type) as billing_type,
  coalesce(g.billing_document,b.billing_document) as billing_document,
  coalesce(g.billing_name,b.billing_name) as billing_name,
  coalesce(g.billing_address,b.billing_address) as billing_address,
  case when coalesce(g.billing_type,b.billing_type) is not null then 'provided'
    when t.participation_amount > 0 then 'missing' else 'not_required' end as billing_state,
  concat_ws(' ',pr.search_text,t.attendee_search,coalesce(g.billing_document,b.billing_document),
    coalesce(g.billing_name,b.billing_name),coalesce(g.company_name_snapshot,r.company_snapshot)) as search_text
from public.participation_payment_requests pr join totals t on t.id=pr.id
join public.activities a on a.id=pr.activity_id
left join public.member_group_requests g on g.id=pr.id and pr.kind='group'
left join public.registrations r on r.id=pr.id and pr.kind='individual'
left join public.registration_billing_details b on b.registration_id=r.id
where not a.is_free or t.participation_amount>0 or coalesce(g.billing_type,b.billing_type) is not null;

-- Existing correction RPC remains compatible, but cannot add data to zero-price groups.
alter function public.correct_member_group_billing(uuid,jsonb,text) rename to correct_member_group_billing_before_guard;
revoke all on function public.correct_member_group_billing_before_guard(uuid,jsonb,text) from public,anon,authenticated,service_role;
create function public.correct_member_group_billing(p_request_id uuid,p_billing jsonb,p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$
begin
  if not public.is_internal_user() then raise exception 'UNAUTHORIZED' using errcode='42501'; end if;
  perform 1 from public.member_group_requests where id=p_request_id and billing_type is not null for update;
  if not found then raise exception 'BILLING_DETAILS_NOT_FOUND' using errcode='P0001'; end if;
  return public.correct_member_group_billing_before_guard(p_request_id,public.normalize_participation_billing(p_billing),p_reason);
end $$;
revoke all on function public.correct_member_group_billing(uuid,jsonb,text) from public,anon;
grant execute on function public.correct_member_group_billing(uuid,jsonb,text) to authenticated,service_role;
