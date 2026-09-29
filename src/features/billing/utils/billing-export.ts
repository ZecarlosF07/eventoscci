import type { BillingRequest } from "@/features/billing/types/billing.types";
import { billingLabel, billingStateLabel } from "@/features/billing/utils/billing-display";
import type { ExportTable } from "@/utils/xlsx-export";

export function billingRequestsToTable(items: BillingRequest[]): ExportTable {
  const headers = ["Código", "Tipo de solicitud", "Empresa / participante", "RUC asociado", "Empresa asociada", "Comprobante", "Documento del destinatario", "Destinatario", "Dirección fiscal", "Fecha", "Importe de participación", "Importe validado", "Saldo pendiente", "Confirmaciones anteriores sin pago registrado", "Cortesías", "Situación"];
  const rows = items.map((item) => [item.code, item.kind === "group" ? "Grupal" : "Individual", item.name, item.company_ruc, item.company_name,
    billingLabel(item), item.billing_document, item.billing_name, item.billing_address, item.created_at, item.participation_amount,
    item.validated_amount, item.pending_amount, item.legacy_amount, item.complimentary_count, billingStateLabel(item.status)]);
  return { headers, rows };
}
