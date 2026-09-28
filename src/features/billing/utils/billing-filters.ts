import { z } from "zod";
import type { BillingFilters } from "@/features/billing/types/billing.types";

export const BILLING_PAGE_SIZE = 20;
const MAX_PAGE = 100000;
export const firstBillingValue = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? "" : value ?? "";
const pageNumber = (value: string | string[] | undefined) => {
  const parsed = Number(firstBillingValue(value));
  return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= MAX_PAGE ? parsed : 1;
};
export function parseBillingFilters(query: Record<string, string | string[] | undefined>): BillingFilters {
  const type = firstBillingValue(query.comprobante);
  const state = firstBillingValue(query.estado);
  const company = firstBillingValue(query.empresa);
  const requestId = firstBillingValue(query.solicitud);
  return { query: firstBillingValue(query.q).trim().slice(0, 150),
    type: ["boleta", "factura", "missing", "not_required"].includes(type) ? type : "all",
    state: ["pending", "partial", "complete", "cancelled"].includes(state) ? state : "all",
    page: pageNumber(query.pagina), companyPage: pageNumber(query.pagina_solicitudes),
    company: /^\d{11}$/.test(company) || company === "sin-empresa" ? company : undefined,
    requestId: z.uuid().safeParse(requestId).success ? requestId : undefined };
}
export function billingParams(filters: BillingFilters): Record<string, string> {
  return { vista: "comprobantes", q: filters.query, comprobante: filters.type, estado: filters.state,
    pagina: String(filters.page), pagina_solicitudes: String(filters.companyPage),
    ...(filters.company ? { empresa: filters.company } : {}), ...(filters.requestId ? { solicitud: filters.requestId } : {}) };
}
export function billingUrl(activityId: string, filters?: BillingFilters): string {
  return `/admin/inscripciones/${activityId}/pagos?${new URLSearchParams(filters ? billingParams(filters) : { vista: "comprobantes" })}`;
}
