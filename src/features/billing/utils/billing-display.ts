import type { BillingRequest } from "@/features/billing/types/billing.types";

export const billingMoney = (amount: number | null) => `S/ ${(amount ?? 0).toFixed(2)}`;
export function billingLabel(item: BillingRequest): string {
  if (item.billing_type === "factura") return "Factura";
  if (item.billing_type === "boleta") return "Boleta";
  return item.billing_state === "missing" ? "Sin datos de comprobante" : "No requiere comprobante";
}
export function billingCopyText(item: BillingRequest): string {
  return [item.code, billingLabel(item), item.billing_type === "factura" ? `RUC: ${item.billing_document}` : `DNI: ${item.billing_document}`,
    item.billing_name, item.billing_address].filter(Boolean).join("\n");
}
const STATE_LABELS: Record<string, string> = { pending: "Pendiente", partial: "Pago parcial", complete: "Sin saldo pendiente", cancelled: "Cancelada" };
export const billingStateLabel = (state: string | null) => STATE_LABELS[state ?? ""] ?? "—";
