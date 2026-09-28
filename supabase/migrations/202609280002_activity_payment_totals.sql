-- Full balances per activity; participation and optional certificates never share a sum.
create view public.activity_payment_totals with (security_invoker = true) as
select a.id as activity_id,
  coalesce(p.pending_requests, 0) as pending_requests,
  coalesce(p.pending_amount, 0) as pending_amount,
  coalesce(p.validated_amount, 0) as validated_amount,
  coalesce(p.legacy_amount, 0) as legacy_amount,
  coalesce(c.pending_requests, 0) as certificate_pending_requests,
  coalesce(c.pending_amount, 0) as certificate_pending_amount
from public.activities a
left join lateral (
  select count(*) filter (where pending_count > 0) as pending_requests,
    sum(pending_amount) as pending_amount, sum(validated_amount) as validated_amount,
    sum(legacy_amount) as legacy_amount
  from public.participation_payment_requests where activity_id = a.id
) p on true
left join lateral (
  select count(*) filter (where status = 'pending') as pending_requests,
    sum(pending_amount) as pending_amount
  from public.certificate_payment_requests where activity_id = a.id
) c on true
where a.deleted_at is null and a.status <> 'archived';
revoke all on public.activity_payment_totals from public, anon;
grant select on public.activity_payment_totals to authenticated, service_role;
