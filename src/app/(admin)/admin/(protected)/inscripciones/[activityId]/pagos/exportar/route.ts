import { z } from "zod";

import { getAdminSession } from "@/features/auth/services/admin-session";
import { applyPaymentFilters } from "@/features/participation/queries/apply-payment-filters";
import type { ActivityPaymentsPageProps, PaymentRequest } from "@/features/participation/types/payment.types";
import { paymentRequestsToCsv } from "@/features/participation/utils/payment-csv";
import { parsePaymentFilters } from "@/features/participation/utils/payment-filters";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const EXPORT_BATCH_SIZE = 100;
const EXPORT_LIMIT = 5000;

export async function GET(request: Request, { params }: Pick<ActivityPaymentsPageProps, "params">): Promise<Response> {
  if (!await getAdminSession()) return new Response("No autorizado", { status: 401 });
  const { activityId } = await params;
  if (!z.uuid().safeParse(activityId).success) return new Response("Actividad inválida", { status: 400 });
  const filters = parsePaymentFilters(Object.fromEntries(new URL(request.url).searchParams));
  const client = await createServerSupabaseClient();
  const items: PaymentRequest[] = [];
  let total = 0;
  do {
    const query = applyPaymentFilters(client.from("participation_payment_requests").select("*", { count: "exact" })
      .eq("activity_id", activityId).order("created_at").order("id"), filters);
    const { data, count, error } = await query.range(items.length, items.length + EXPORT_BATCH_SIZE - 1);
    if (error) return new Response("No fue posible preparar la exportación. Reintenta.", { status: 500 });
    total = count ?? 0;
    if (total > EXPORT_LIMIT) return new Response("La exportación supera 5000 solicitudes. Aplica filtros más específicos.", { status: 413 });
    if (!data?.length) break;
    items.push(...data);
  } while (items.length < total);
  return new Response(paymentRequestsToCsv(items), { headers: {
    "Cache-Control": "private, no-store", "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": 'attachment; filename="pagos-participacion.csv"',
  } });
}
