import "server-only";
import { requireAdmin } from "@/features/auth/services/admin-session";
import { applyBillingFilters } from "@/features/billing/queries/apply-billing-filters";
import { billingDetailSchema } from "@/features/billing/schemas/billing-detail.schema";
import type { BillingCompany, BillingDetailData, BillingFilters, BillingPage, BillingRequest } from "@/features/billing/types/billing.types";
import { BILLING_PAGE_SIZE } from "@/features/billing/utils/billing-filters";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getBillingRequests(activityId: string, filters: BillingFilters, grouped = false): Promise<BillingPage<BillingRequest>> {
  await requireAdmin();
  const client = await createServerSupabaseClient();
  let query = applyBillingFilters(client.from("participation_billing_requests").select("*", { count: "exact" })
    .eq("activity_id", activityId).order("created_at").order("id"), filters);
  if (grouped && filters.company) query = query.eq("company_key", filters.company);
  const page = grouped ? filters.companyPage : filters.page;
  const from = (page - 1) * BILLING_PAGE_SIZE;
  const { data, count, error } = await query.range(from, from + BILLING_PAGE_SIZE - 1);
  if (error) throw new Error("No fue posible consultar los datos para comprobantes.", { cause: error });
  const pageCount = Math.max(1, Math.ceil((count ?? 0) / BILLING_PAGE_SIZE));
  if (page > pageCount) return getBillingRequests(activityId, { ...filters, ...(grouped ? { companyPage: pageCount } : { page: pageCount }) }, grouped);
  return { items: data ?? [], total: count ?? 0, page, pageCount };
}
export async function getBillingCompanies(activityId: string, filters: BillingFilters): Promise<BillingPage<BillingCompany>> {
  await requireAdmin();
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("get_participation_billing_companies", {
    p_activity_id: activityId, p_query: filters.query, p_billing_type: filters.type, p_state: filters.state,
    p_limit: BILLING_PAGE_SIZE, p_offset: (filters.page - 1) * BILLING_PAGE_SIZE,
  });
  if (error) throw new Error("No fue posible consultar las empresas.", { cause: error });
  if (!data?.length && filters.page > 1) return getBillingCompanies(activityId, { ...filters, page: 1 });
  const total = data?.[0]?.total_count ?? 0;
  return { items: data ?? [], total, page: filters.page, pageCount: Math.max(1, Math.ceil(total / BILLING_PAGE_SIZE)) };
}
/** Protected by the API's internal session guard and the caller's session/RLS. */
export async function getBillingDetail(activityId: string, requestId: string): Promise<BillingDetailData | null> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client.from("participation_billing_requests")
    .select("activity_id,id,kind,code,name,company_name,company_ruc,billing_type,billing_document,billing_name,billing_address,billing_state,status,participation_amount,validated_amount,pending_amount,legacy_amount,complimentary_count")
    .eq("activity_id", activityId).eq("id", requestId).maybeSingle();
  if (error) throw new Error("No fue posible abrir los datos de esta solicitud.", { cause: error });
  return data ? billingDetailSchema.parse(data) : null;
}
