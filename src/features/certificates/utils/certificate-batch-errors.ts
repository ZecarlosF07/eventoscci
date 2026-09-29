export function describeCertificateBatchError(reason: string | null): string {
  if (!reason) return "No se pudo completar; revisa la inscripción.";
  if (reason === "CERTIFICATE_PAYMENT_OR_REQUEST_PENDING") return "Falta solicitar o validar el pago del certificado.";
  if (reason === "CERTIFICATE_NOT_AVAILABLE") return "La actividad ya no ofrece certificado.";
  if (reason === "REGISTRATION_NOT_CONFIRMED") return "La inscripción ya no está confirmada.";
  if (reason === "ATTENDANCE_NOT_ATTENDED") return "La asistencia ya no está marcada como «Asistió».";
  if (reason.length > 120 || /^[A-Z_]+$/.test(reason)) return "No se pudo completar; revisa la inscripción.";
  return reason;
}
