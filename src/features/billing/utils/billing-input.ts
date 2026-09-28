import type { BillingInput, BillingSource } from "@/features/billing/types/billing.types";

export function emptyBilling(type: BillingInput["type"]): BillingInput { return { type, document: "", name: "", ...(type === "factura" ? { address: "" } : {}) }; }
export function copyBillingSource(type: BillingInput["type"], source: BillingSource): BillingInput {
  return { type, document: type === "boleta" && source.documentType !== "dni" ? "" : source.document,
    name: source.name, ...(type === "factura" ? { address: source.address ?? "" } : {}) };
}
export function applicableBilling(input: BillingInput): BillingInput {
  return input.type === "boleta" ? { type: input.type, document: input.document, name: input.name } : input;
}
