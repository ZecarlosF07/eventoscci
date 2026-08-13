import type { OperationNoticeProps } from "@/components/molecules/OperationNotice/types/operation-notice.types";

const MESSAGES: Record<string, { error?: boolean; text: string }> = {
  "asistencia-actualizada": { text: "La asistencia se actualizó correctamente." },
  "cancelada": { text: "La inscripción fue cancelada y permanece en el historial." },
  "confirmada": { text: "La preinscripción fue confirmada correctamente." },
  "error-asistencia": { error: true, text: "No fue posible actualizar la asistencia." },
  "error-cancelar": { error: true, text: "No fue posible cancelar la inscripción." },
  "error-confirmar": { error: true, text: "No fue posible confirmar la inscripción." },
  "error-seleccion": { error: true, text: "Selecciona al menos un registro y una acción válida." },
  "ya-cancelada": { text: "La inscripción ya se encontraba cancelada; no se duplicó la operación." },
  "ya-confirmada": { text: "La inscripción ya estaba confirmada; se conservó la fecha original." },
};

export function OperationNotice({ result }: OperationNoticeProps) {
  const message = result ? MESSAGES[result] : undefined;
  if (!message) return null;
  return (
    <p className={`rounded-xl border px-4 py-3 text-sm font-medium ${message.error ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`} role={message.error ? "alert" : "status"}>
      {message.text}
    </p>
  );
}
