import type { MemberGroupAdminListItem } from "@/features/member-groups/types/member-group.types";

export interface MemberGroupExportSeat {
  requestId: string;
  code: string;
  firstNames: string;
  lastNames: string;
  document: string;
  email: string;
  status: string;
  price: number;
}

function csvCell(value: string | number | null): string {
  let text = value === null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function memberGroupsToCsv(groups: MemberGroupAdminListItem[], seats: MemberGroupExportSeat[]): string {
  const seatMap = new Map<string, MemberGroupExportSeat[]>();
  seats.forEach((seat) => seatMap.set(seat.requestId, [...(seatMap.get(seat.requestId) ?? []), seat]));
  const headers = ["Código solicitud", "Actividad", "RUC asociado", "Empresa asociada", "Comprobante", "Documento facturación", "Código asistente", "Documento asistente", "Nombres", "Apellidos", "Correo", "Estado", "Tarifa individual", "Total solicitud (una vez)", "Importe confirmado (una vez)", "Saldo pendiente (una vez)", "Fecha solicitud"];
  const rows = groups.flatMap((group) => (seatMap.get(group.id) ?? []).map((seat, index) => [
    group.request_code, group.activity_title, group.company_ruc, group.company_name_snapshot,
    group.billing_type, group.billing_document, seat.code, seat.document,
    seat.firstNames, seat.lastNames, seat.email, seat.status, seat.price,
    index === 0 ? group.total : null,
    index === 0 ? group.confirmed_amount : null,
    index === 0 ? group.pending_amount : null,
    group.created_at,
  ]));
  return `\uFEFF${[headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
}
