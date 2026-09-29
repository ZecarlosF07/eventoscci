import type { PaymentRequest } from "@/features/participation/types/payment.types";
import type { ExportTable } from "@/utils/xlsx-export";

export function paymentRequestsToTable(items: PaymentRequest[]): ExportTable {
  const headers = ["Código", "Tipo", "Titular / empresa", "RUC asociado", "Plazas", "Plazas por pagar", "Saldo pendiente", "Importe validado", "Confirmaciones históricas sin referencia", "Pases gratuitos", "Estado", "Fecha solicitud"];
  const rows = items.map((item) => [item.code, item.kind === "group" ? "Grupal" : "Individual", item.name,
    item.company_ruc, item.seat_count, item.pending_count, item.pending_amount, item.validated_amount,
    item.legacy_amount, item.complimentary_count, item.status, item.created_at]);
  return { headers, rows };
}
