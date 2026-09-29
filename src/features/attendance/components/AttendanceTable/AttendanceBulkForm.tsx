"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/atoms/Button";
import { useFilterWorkspace } from "@/features/admin-filters/components/FilterWorkspace";
import { SelectedInputs, SelectionSummary, useSelectionWorkspace } from "@/features/admin-filters/components/SelectionWorkspace";
import { WorkspaceDraftInput, WorkspaceDraftSelect } from "@/features/admin-filters/components/WorkspaceDraftControls";
import { updateAttendanceWorkspaceAction } from "@/features/attendance/mutations/attendance.actions";
import type { AttendanceBulkFormProps } from "@/features/attendance/types/attendance.types";

export function AttendanceBulkForm({ activityId, visibleIds }: AttendanceBulkFormProps) {
  const { selected, clear } = useSelectionWorkspace();
  const { busy } = useFilterWorkspace();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  if (!selected.length) return message ? <p role="status" className="rounded-xl bg-cci-50 p-3 text-sm">{message}</p> : null;
  return <form id="bulk-attendance-form" aria-label="Acciones para participantes seleccionados" className="space-y-2 rounded-xl border border-cci-200 bg-cci-50 p-3" onSubmit={(event) => {
    event.preventDefault();
    if (!selected.length) { setMessage("Selecciona al menos un participante."); return; }
    if (selected.length > 500) { setMessage("Puedes procesar hasta 500 participantes por operación; no se ha modificado ninguno."); return; }
    const hidden = selected.filter((item) => !visibleIds.includes(item.id)).length;
    if (hidden && !window.confirm(`Se procesarán ${selected.length} participantes, incluidos ${hidden} fuera de esta vista. Revisa la selección antes de continuar. ¿Confirmar?`)) return;
    const values = new FormData(event.currentTarget);
    const ids = selected.map((item) => item.id);
    startTransition(async () => {
      try { const result = await updateAttendanceWorkspaceAction(activityId, values); setMessage(result.message); if (result.success) clear(ids); }
      catch { setMessage("No se pudo completar la operación. La selección se conserva; revisa el estado antes de reintentar."); }
    });
  }}>
    <SelectionSummary visibleIds={visibleIds} compact />
    <SelectedInputs name="attendance_ids" />
    <fieldset disabled={pending || busy} className="flex flex-wrap items-start gap-2 sm:grid sm:grid-cols-[minmax(180px,260px)_minmax(0,1fr)_auto]">
      <legend className="sr-only">Actualizar la asistencia de los seleccionados</legend>
      <div className="min-w-0 flex-1">
      <WorkspaceDraftSelect aria-label="Estado masivo" defaultValue="attended" draftKey="bulk-status" name="status"><option value="attended">Marcar asistieron</option><option value="absent">Marcar no asistieron</option><option value="pending">Devolver a pendiente</option></WorkspaceDraftSelect>
      </div>
      <details className="order-3 min-w-0 w-full sm:order-none"><summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold text-cci-700">Añadir nota (opcional)</summary>
        <WorkspaceDraftInput aria-label="Nota masiva" className="mt-1 w-full" draftKey="bulk-notes" maxLength={500} name="notes" placeholder="Nota para los seleccionados" />
      </details>
      <Button className="order-2 sm:order-none sm:justify-self-end" disabled={pending || busy} type="submit">{pending ? "Aplicando…" : `Aplicar a ${selected.length} ${selected.length === 1 ? "persona" : "personas"}`}</Button>
    </fieldset>
    {message ? <p role="status" className="text-sm">{message}</p> : null}
  </form>;
}
