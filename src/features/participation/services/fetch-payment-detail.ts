import { fetchAdminDetail } from "@/features/admin-details/services/fetch-admin-detail";
import { paymentDetailSchema } from "@/features/participation/schemas/payment-detail.schema";
import type { PaymentDetailData } from "@/features/participation/types/payment-detail.types";

export async function fetchPaymentDetail(activityId: string, requestId: string, signal: AbortSignal): Promise<PaymentDetailData> {
  const data = await fetchAdminDetail(`/api/admin/activities/${activityId}/payments/${requestId}`, signal, paymentDetailSchema);
  if (data.request.id !== requestId) throw new Error("La respuesta del detalle no es válida. Intenta nuevamente.");
  return data;
}
