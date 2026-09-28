"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/atoms/Button";
import { useFilterWorkspace } from "@/features/admin-filters/components/FilterWorkspace";
import { SelectedInputs, useSelectionWorkspace } from "@/features/admin-filters/components/SelectionWorkspace";
import { WorkspaceDraftInput, WorkspaceDraftSelect } from "@/features/admin-filters/components/WorkspaceDraftControls";
import { updateAttendanceWorkspaceAction } from "@/features/attendance/mutations/attendance.actions";
import type { AttendanceBulkFormProps } from "@/features/attendance/types/attendance.types";

export function AttendanceBulkForm({ activityId, visibleIds }: AttendanceBulkFormProps) {
  const { selected, clear } = useSelectionWorkspace();
  const { busy } = useFilterWorkspace();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  return <form id="bulk-attendance-form" className="space-y-3 rounded-2xl border border-cci-100 bg-white p-4" onSubmit={(event) => {
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
    <SelectedInputs name="attendance_ids" />
    <fieldset disabled={pending || busy} className="grid gap-3 md:grid-cols-[1fr_2fr_auto]">
      <WorkspaceDraftSelect aria-label="Estado masivo" defaultValue="attended" draftKey="bulk-status" name="status"><option value="attended">Marcar asistieron</option><option value="absent">Marcar no asistieron</option><option value="pending">Devolver a pendiente</option></WorkspaceDraftSelect>
      <WorkspaceDraftInput aria-label="Nota masiva" draftKey="bulk-notes" maxLength={500} name="notes" placeholder="Nota opcional para los seleccionados" />
      <Button disabled={pending || busy || !selected.length} type="submit">{pending ? "Aplicando…" : `Aplicar a ${selected.length} seleccionados`}</Button>
    </fieldset>
    {message ? <p role="status" className="text-sm">{message}</p> : null}
  </form>;
}
