import "server-only";

import { applyPaymentFilters } from "@/features/participation/queries/apply-payment-filters";
import type { CertificatePaymentRequest, PaymentFilters, PaymentPage, PaymentRequest } from "@/features/participation/types/payment.types";
import { PAYMENTS_PAGE_SIZE } from "@/features/participation/utils/payment-filters";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { escapePostgrestSearch } from "@/utils/postgrest-search";

export async function getActivityPayments(activityId: string, filters: PaymentFilters): Promise<PaymentPage<PaymentRequest>> {
  const client = await createServerSupabaseClient();
  let query = client.from("participation_payment_requests").select("*", { count: "exact" })
    .eq("activity_id", activityId).order("created_at").order("id");
  query = applyPaymentFilters(query, filters);
  const from = (filters.page - 1) * PAYMENTS_PAGE_SIZE;
  const { data, count, error } = await query.range(from, from + PAYMENTS_PAGE_SIZE - 1);
  if (error) throw new Error("No fue posible consultar los pagos de participación.", { cause: error });
  const pageCount = Math.max(1, Math.ceil((count ?? 0) / PAYMENTS_PAGE_SIZE));
  if (filters.page > pageCount) return getActivityPayments(activityId, { ...filters, page: pageCount });
  return { items: data ?? [], total: count ?? 0, page: filters.page,
    pageCount };
}
export async function getCertificatePayments(activityId: string, filters: PaymentFilters): Promise<PaymentPage<CertificatePaymentRequest>> {
  const client = await createServerSupabaseClient();
  let query = client.from("certificate_payment_requests").select("*", { count: "exact" })
    .eq("activity_id", activityId).order("created_at").order("id");
  if (filters.certificateState !== "all") query = query.eq("status", filters.certificateState);
  if (filters.query) query = query.ilike("search_text", `%${escapePostgrestSearch(filters.query)}%`);
  const from = (filters.certificatePage - 1) * PAYMENTS_PAGE_SIZE;
  const { data, count, error } = await query.range(from, from + PAYMENTS_PAGE_SIZE - 1);
  if (error) throw new Error("No fue posible consultar los pagos de certificados.", { cause: error });
  const pageCount = Math.max(1, Math.ceil((count ?? 0) / PAYMENTS_PAGE_SIZE));
  if (filters.certificatePage > pageCount) return getCertificatePayments(activityId, { ...filters, certificatePage: pageCount });
  let items = data ?? [];
  let outsideResultId: string | undefined;
  if (filters.certificateId && !items.some((item) => item.id === filters.certificateId)) {
    const selected = await client.from("certificate_payment_requests").select("*")
      .eq("activity_id", activityId).eq("id", filters.certificateId).maybeSingle();
    if (selected.error) throw new Error("No fue posible abrir el pago del certificado.", { cause: selected.error });
    if (selected.data) { items = [selected.data, ...items]; outsideResultId = filters.certificateId; }
  }
  return { items, total: count ?? 0, page: filters.certificatePage,
    pageCount, outsideResultId };
}

export async function getActivityPaymentTotals(activityId: string) {
  const client = await createServerSupabaseClient();
  const { data, error } = await client.from("activity_payment_totals").select("*").eq("activity_id", activityId).maybeSingle();
  if (error) throw new Error("No fue posible calcular los saldos de la actividad.", { cause: error });
  return data;
}
