import type {
  CertificateCommercialStatus,
  CertificateCommercialStatusInput,
} from "@/features/registrations/types/certificate-commercial-status.types";

export const CERTIFICATE_COMMERCIAL_STATUS_LABELS: Record<CertificateCommercialStatus, string> = {
  included_pending_attendance: "Incluido · pendiente de asistencia",
  issued: "Certificado emitido",
  not_requested: "Sin solicitar",
  payment_pending: "Solicitado · pago pendiente",
  payment_verified_pending_attendance: "Pago verificado · pendiente de asistencia",
  ready_to_issue: "Listo para emitir",
  revoked: "Certificado revocado",
  unavailable: "No disponible",
};

export function getCertificateCommercialStatus({
  attendanceStatus,
  certificateMode,
  certificatePaymentVerifiedAt,
  certificateRequestedAt,
  certificateStatus,
  currentMode,
  registrationStatus,
}: CertificateCommercialStatusInput): CertificateCommercialStatus {
  if (certificateStatus === "revoked") return "revoked";
  if (certificateStatus === "issued") return "issued";

  const effectiveMode = currentMode === "none" || currentMode === "included"
    ? currentMode
    : certificateMode;
  if (effectiveMode === "none") return "unavailable";

  const attended = registrationStatus === "confirmed" && attendanceStatus === "attended";
  if (effectiveMode === "included") {
    return attended ? "ready_to_issue" : "included_pending_attendance";
  }
  if (!certificateRequestedAt) return "not_requested";
  if (!certificatePaymentVerifiedAt) return "payment_pending";
  return attended ? "ready_to_issue" : "payment_verified_pending_attendance";
}
