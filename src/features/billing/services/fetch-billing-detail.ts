import { fetchAdminDetail } from "@/features/admin-details/services/fetch-admin-detail";
import { billingDetailSchema } from "@/features/billing/schemas/billing-detail.schema";
import type { BillingDetailData } from "@/features/billing/types/billing.types";

export async function fetchBillingDetail(activityId: string, requestId: string, signal: AbortSignal): Promise<BillingDetailData> {
  const data = await fetchAdminDetail(`/api/admin/activities/${activityId}/billing/${requestId}`, signal, billingDetailSchema);
  if (data.id !== requestId || data.activity_id !== activityId) throw new Error("La respuesta del detalle no es válida. Intenta nuevamente.");
  return data;
}
