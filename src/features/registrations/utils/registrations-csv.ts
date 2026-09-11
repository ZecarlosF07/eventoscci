import type { RegistrationAdminItem } from "@/features/registrations/types/registration.types";
import {
  CERTIFICATE_COMMERCIAL_STATUS_LABELS,
  getCertificateCommercialStatus,
} from "@/features/registrations/utils/certificate-commercial-status";

const REGISTRATION_LABELS = { cancelled: "Cancelado", confirmed: "Confirmado", pending: "Pendiente de verificación" } as const;
const ATTENDANCE_LABELS = { absent: "No asistió", attended: "Asistió", pending: "Pendiente" } as const;

function csvCell(value: string | number | null): string {
  let text = value === null ? "" : String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function registrationsToCsv(registrations: RegistrationAdminItem[]): string {
  const headers = [
    "Actividad", "Tipo de documento", "Documento", "Nombres", "Apellidos",
    "Correo", "Celular", "Cargo", "Empresa", "RUC", "Tipo de inscripción",
    "Estado", "Asistencia", "Código", "Precio registrado", "Certificado",
    "Precio del certificado", "Estado comercial", "Certificado solicitado",
    "Solicitud registrada por", "Pago verificado", "Pago verificado por",
  ];
  const rows = registrations.map((item) => [
    item.activity.title,
    item.person.document_type.toUpperCase(),
    item.person.document_number,
    item.person.first_names,
    item.person.last_names,
    item.person.email,
    item.person.phone,
    item.person.job_title,
    item.company_snapshot,
    item.ruc_snapshot,
    item.registration_type === "member" ? "Asociado" : "General",
    REGISTRATION_LABELS[item.status],
    ATTENDANCE_LABELS[item.attendance[0]?.status ?? "pending"],
    item.registration_code,
    item.price_snapshot,
    item.certificate_mode_snapshot === "included"
      ? "Incluido"
      : item.certificate_mode_snapshot === "optional_paid" ? "Opcional pagado" : "No disponible",
    item.certificate_price_snapshot,
    CERTIFICATE_COMMERCIAL_STATUS_LABELS[getCertificateCommercialStatus({
      attendanceStatus: item.attendance[0]?.status ?? "pending",
      certificateMode: item.certificate_mode_snapshot,
      certificatePaymentVerifiedAt: item.certificate_payment_verified_at,
      certificateRequestedAt: item.certificate_requested_at,
      certificateStatus: item.certificate[0]?.status,
      currentMode: item.activity.certificate_mode,
      registrationStatus: item.status,
    })],
    item.certificate_requested_at,
    item.certificateRequestedByName ?? (item.certificate_requested_at ? "Participante" : null),
    item.certificate_payment_verified_at,
    item.certificatePaymentVerifiedByName,
  ]);
  return `\uFEFF${[headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
}
