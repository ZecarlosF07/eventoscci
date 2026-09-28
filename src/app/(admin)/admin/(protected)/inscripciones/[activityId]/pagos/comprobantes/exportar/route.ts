import { z } from "zod";
import { getAdminSession } from "@/features/auth/services/admin-session";
import { applyBillingFilters } from "@/features/billing/queries/apply-billing-filters";
import type { BillingRequest } from "@/features/billing/types/billing.types";
import { billingRequestsToCsv } from "@/features/billing/utils/billing-csv";
import { parseBillingFilters } from "@/features/billing/utils/billing-filters";
import type { ActivityPaymentsPageProps } from "@/features/participation/types/payment.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const EXPORT_BATCH_SIZE = 100;
const EXPORT_LIMIT = 5000;
export async function GET(request: Request, { params }: Pick<ActivityPaymentsPageProps, "params">): Promise<Response> {
  if (!await getAdminSession()) return new Response("No autorizado", { status: 401 });
  const { activityId } = await params;
  if (!z.uuid().safeParse(activityId).success) return new Response("Actividad inválida", { status: 400 });
  const filters = parseBillingFilters(Object.fromEntries(new URL(request.url).searchParams));
  const client = await createServerSupabaseClient();
  const items: BillingRequest[] = [];
  let total = 0;
  do {
    const query = applyBillingFilters(client.from("participation_billing_requests").select("*", { count: "exact" })
      .eq("activity_id", activityId).order("created_at").order("id"), filters);
    const { data, count, error } = await query.range(items.length, items.length + EXPORT_BATCH_SIZE - 1);
    if (error) return new Response("No fue posible exportar. Reintenta.", { status: 500 });
    total = count ?? 0;
    if (total > EXPORT_LIMIT) return new Response("Supera 5000 solicitudes. Aplica filtros más específicos.", { status: 413 });
    if (!data?.length) break;
    items.push(...data);
  } while (items.length < total);
  return new Response(billingRequestsToCsv(items), { headers: { "Cache-Control": "private, no-store", "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="datos-comprobantes.csv"' } });
}
