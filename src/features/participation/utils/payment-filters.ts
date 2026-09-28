import { z } from "zod";

import type { PaymentFilters, PaymentSearchParams, PaymentState } from "@/features/participation/types/payment.types";
import { getActivityPaymentsRoute } from "@/features/participation/utils/participation-routes";

export const PAYMENTS_PAGE_SIZE = 20;
export function firstPaymentValue(value?: string | string[]): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
function page(value?: string | string[]): number {
  const parsed = Number(firstPaymentValue(value));
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : 1;
}
function state(value?: string | string[]): PaymentState {
  const parsed = firstPaymentValue(value);
  return parsed === "complete" || parsed === "all" ? parsed : "pending";
}
export function parsePaymentFilters(params: PaymentSearchParams): PaymentFilters {
  const kind = firstPaymentValue(params.tipo);
  return {
    page: page(params.pagina), certificatePage: page(params.pagina_certificados),
    state: state(params.estado), certificateState: state(params.estado_certificado),
    kind: kind === "individual" || kind === "group" ? kind : "all",
    query: firstPaymentValue(params.q)?.trim().slice(0, 150) ?? "",
    requestId: z.uuid().safeParse(firstPaymentValue(params.solicitud)).data,
    certificateId: z.uuid().safeParse(firstPaymentValue(params.certificado)).data,
  };
}
export function paymentFilterParams(filters: PaymentFilters): Record<string, string> {
  return { estado: filters.state, estado_certificado: filters.certificateState,
    tipo: filters.kind, q: filters.query, pagina: String(filters.page),
    pagina_certificados: String(filters.certificatePage) };
}
export function paymentWorkspaceUrl(activityId: string, filters: PaymentFilters, requestId?: string, certificateId?: string): string {
  const params = new URLSearchParams(paymentFilterParams(filters));
  if (requestId) params.set("solicitud", requestId);
  if (certificateId) params.set("certificado", certificateId);
  return `${getActivityPaymentsRoute(activityId)}?${params}${certificateId ? "#certificados" : ""}`;
}
export function paymentAgeDays(createdAt: string | null, now = Date.now()): number {
  return createdAt ? Math.max(0, Math.floor((now - new Date(createdAt).getTime()) / 86_400_000)) : 0;
}
