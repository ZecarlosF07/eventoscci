import type { OperationNoticeProps } from "@/components/molecules/OperationNotice/types/operation-notice.types";

const MESSAGES: Record<string, { tone?: "error" | "warning"; text: string }> = {
  "asistencia-actualizada": { text: "La asistencia se actualizó correctamente." },
  "cancelada": { text: "La inscripción fue cancelada y permanece en el historial." },
  "confirmada": { text: "La inscripción fue confirmada correctamente." },
  "confirmada-correo-fallido": { tone: "warning", text: "La inscripción quedó confirmada, pero el correo no pudo enviarse. Revisa Notificaciones para ver el detalle." },
  "error-asistencia": { tone: "error", text: "No fue posible actualizar la asistencia." },
  "error-cancelar": { tone: "error", text: "No fue posible cancelar la inscripción." },
  "error-confirmar": { tone: "error", text: "No fue posible confirmar la inscripción." },
  "error-inscripcion-no-confirmada": { tone: "error", text: "Solo puedes marcar asistencia de inscripciones confirmadas." },
  "error-seleccion": { tone: "error", text: "Selecciona al menos un participante confirmado y una acción válida." },
  "ya-cancelada": { text: "La inscripción ya se encontraba cancelada; no se duplicó la operación." },
  "ya-confirmada": { text: "La inscripción ya estaba confirmada; se conservó la fecha original." },
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
