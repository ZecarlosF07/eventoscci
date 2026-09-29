import { SubmitButton } from "@/components/atoms/SubmitButton";
import { WorkspaceDraftInput, WorkspaceDraftSelect } from "@/features/admin-filters/components/WorkspaceDraftControls";
import { updateAttendanceAction } from "@/features/attendance/mutations/attendance.actions";
import type { AttendanceRowFormProps } from "@/features/attendance/components/AttendanceTable/types/attendance-table.types";

export function AttendanceRowForm({ activityId, item, returnTo }: AttendanceRowFormProps) {
  if (item.registration.status !== "confirmed") return <p className="max-w-52 text-xs leading-5 text-amber-800">Confirma la inscripción antes de registrar asistencia.</p>;
  return (
    <form action={updateAttendanceAction.bind(null, activityId, returnTo)} className="flex flex-wrap items-start gap-2">
      <input name="attendance_ids" type="hidden" value={item.id} />
      <WorkspaceDraftSelect draftKey={`${item.id}-status`} aria-label="Nuevo estado" className="sm:w-28" defaultValue={item.status} name="status"><option value="pending">Pendiente</option><option value="attended">Asistió</option><option value="absent">No asistió</option></WorkspaceDraftSelect>
      <SubmitButton pendingLabel="Guardando…" variant="subtle">Guardar</SubmitButton>
      <details className="min-w-0"><summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold text-cci-700 underline">{item.notes ? "Ver nota" : "Nota opcional"}</summary>
        <WorkspaceDraftInput draftKey={`${item.id}-notes`} aria-label="Notas" className="mt-1 min-w-44" defaultValue={item.notes ?? ""} maxLength={500} name="notes" placeholder="Nota opcional" />
      </details>
    </form>
  );
}
