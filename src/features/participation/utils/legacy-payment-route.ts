import { z } from "zod";

import type { PaymentSearchParams } from "@/features/participation/types/payment.types";
import { firstPaymentValue } from "@/features/participation/utils/payment-filters";
import { getActivityPaymentsRoute } from "@/features/participation/utils/participation-routes";

export function legacyPaymentRoute(params: PaymentSearchParams, groupsOnly = false): string {
  const activityId = z.uuid().safeParse(firstPaymentValue(params.actividad));
  const query = new URLSearchParams();
  const text = firstPaymentValue(params.q);
  if (!activityId.success) {
    query.set("periodo", "payments");
    const type = firstPaymentValue(params.tipo_actividad);
    if (type === "event" || type === "training") query.set("tipo", type);
    return `/admin/inscripciones?${query}`;
  }
  if (text) query.set("q", text.slice(0, 150));
  const status = firstPaymentValue(params.estado);
  query.set("estado", status === "complete" ? "complete" : status === "all" ? "all" : "pending");
  if (groupsOnly) query.set("tipo", "group");
  const page = firstPaymentValue(params.pagina);
  if (page && /^\d+$/.test(page)) query.set("pagina", page);
  return `${getActivityPaymentsRoute(activityId.data)}?${query}`;
}

export function legacyConfirmedRoute(params: PaymentSearchParams): string {
  const activityId = z.uuid().safeParse(firstPaymentValue(params.actividad));
  if (!activityId.success) return "/admin/inscripciones?periodo=all";
  const query = new URLSearchParams({ estado: "confirmed" });
  for (const key of ["q", "pagina", "tipo", "certificado"]) {
    const value = firstPaymentValue(params[key]);
    if (value) query.set(key, value.slice(0, 150));
  }
  return `/admin/inscripciones/${activityId.data}?${query}`;
}
