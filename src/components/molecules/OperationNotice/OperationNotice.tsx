import type { OperationNoticeProps } from "@/components/molecules/OperationNotice/types/operation-notice.types";

const MESSAGES: Record<string, { tone?: "error" | "warning"; text: string }> = {
  "asistencia-actualizada": { text: "La asistencia se actualizó correctamente." },
  "asistencia-actualizada-correo-fallido": { tone: "warning", text: "La asistencia se actualizó, pero una oferta de certificado no pudo enviarse. Revisa Notificaciones para reintentarla." },
  "cancelada": { text: "La inscripción fue cancelada y permanece en el historial." },
  "confirmada": { text: "La inscripción fue confirmada correctamente." },
  "confirmada-correo-fallido": { tone: "warning", text: "La inscripción quedó confirmada, pero el correo no pudo enviarse. Revisa Notificaciones para ver el detalle." },
  "certificado-ya-atendido": { text: "La solicitud de certificado ya figuraba como atendida." },
  "error-asistencia": { tone: "error", text: "No fue posible actualizar la asistencia." },
  "error-actividad-archivada": { tone: "error", text: "La actividad está archivada y sus operaciones permanecen bloqueadas hasta restaurarla." },
  "error-cancelar": { tone: "error", text: "No fue posible cancelar la inscripción." },
  "error-confirmar": { tone: "error", text: "No fue posible confirmar la inscripción." },
  "error-seguimiento-certificado": { tone: "error", text: "No fue posible marcar la solicitud de certificado como atendida." },
  "error-inscripcion-no-confirmada": { tone: "error", text: "Solo puedes marcar asistencia de inscripciones confirmadas." },
  "error-seleccion": { tone: "error", text: "Selecciona al menos un participante confirmado y una acción válida." },
  "ya-cancelada": { text: "La inscripción ya se encontraba cancelada; no se duplicó la operación." },
  "ya-confirmada": { text: "La inscripción ya estaba confirmada; se conservó la fecha original." },
  "seguimiento-certificado": { text: "La solicitud de certificado quedó marcada como atendida." },
};

export function OperationNotice({ result }: OperationNoticeProps) {
  const message = result ? MESSAGES[result] : undefined;
  if (!message) return null;
  const color = message.tone === "error"
    ? "border-rose-200 bg-rose-50 text-rose-800"
    : message.tone === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-emerald-200 bg-emerald-50 text-emerald-800";
  return (
    <p className={`rounded-xl border px-4 py-3 text-sm font-medium ${color}`} role={message.tone === "error" ? "alert" : "status"}>
      {message.text}
    </p>
  );
}
