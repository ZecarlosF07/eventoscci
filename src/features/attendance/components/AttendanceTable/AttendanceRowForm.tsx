import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { SubmitButton } from "@/components/atoms/SubmitButton";
import { updateAttendanceAction } from "@/features/attendance/mutations/attendance.actions";
import type { AttendanceItem } from "@/features/attendance/types/attendance.types";

export function AttendanceRowForm({ activityId, item, returnTo }: { activityId: string; item: AttendanceItem; returnTo: string }) {
  if (item.registration.status !== "confirmed") return <p className="max-w-52 text-xs leading-5 text-amber-800">Confirma la inscripción antes de registrar asistencia.</p>;
  return (
    <form action={updateAttendanceAction.bind(null, activityId, returnTo)} className="flex flex-col gap-2 sm:flex-row">
      <input name="attendance_ids" type="hidden" value={item.id} />
      <Select aria-label="Nuevo estado" className="sm:w-36" defaultValue={item.status} name="status"><option value="pending">Pendiente</option><option value="attended">Asistió</option><option value="absent">No asistió</option></Select>
      <Input aria-label="Notas" className="sm:min-w-44" defaultValue={item.notes ?? ""} maxLength={500} name="notes" placeholder="Nota opcional" />
      <SubmitButton pendingLabel="Guardando…" variant="subtle">Guardar</SubmitButton>
    </form>
  );
}
