import type { BillingInput, BillingSource } from "@/features/billing/types/billing.types";

export function getIndividualBillingSource(formData: FormData, billing: BillingInput): BillingSource {
  const value = (name: string) => String(formData.get(name) ?? "");
  if (billing.type === "boleta") {
    return {
      documentType: value("document_type"),
      document: value("document_number"),
      name: `${value("first_names")} ${value("last_names")}`.trim(),
    };
  }
  // The participant's province and historical address are not fiscal addresses.
  return { document: value("ruc"), name: value("company"), address: billing.address ?? "" };
}
