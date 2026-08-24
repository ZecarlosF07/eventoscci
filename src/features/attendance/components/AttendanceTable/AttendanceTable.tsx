import { Checkbox } from "@/components/atoms/Checkbox";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { SubmitButton } from "@/components/atoms/SubmitButton";
import { Text } from "@/components/atoms/Text";
import { AttendanceStatusBadge } from "@/features/attendance/components/AttendanceStatusBadge";
import type { AttendanceTableProps } from "@/features/attendance/components/AttendanceTable/types/attendance-table.types";
import { updateAttendanceAction } from "@/features/attendance/mutations/attendance.actions";
import { RegistrationStatusBadge } from "@/features/registrations/components/RegistrationStatusBadge";
import { REGISTRATION_TYPE_LABELS } from "@/features/registrations/constants/registration.constants";
import { formatRegistrationDate } from "@/features/registrations/utils/registration-formatters";

export function AttendanceTable({ activityId, attendance, returnTo }: AttendanceTableProps) {
  if (!attendance.length) return <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center"><Text>Esta actividad no tiene registros con los filtros seleccionados.</Text></div>;
  const action = updateAttendanceAction.bind(null, activityId, returnTo);
  return (
    <div className="space-y-4">
      <form action={action} className="grid gap-3 rounded-2xl border border-cci-100 bg-white p-4 md:grid-cols-[1fr_2fr_auto]" id="bulk-attendance-form">
        <Select aria-label="Estado masivo" defaultValue="attended" name="status"><option value="attended">Marcar asistieron</option><option value="absent">Marcar no asistieron</option><option value="pending">Devolver a pendiente</option></Select>
        <Input aria-label="Nota masiva" maxLength={500} name="notes" placeholder="Nota opcional para los seleccionados" />
        <SubmitButton pendingLabel="Aplicando…">Aplicar a seleccionados</SubmitButton>
      </form>
      <div className="overflow-x-auto rounded-3xl border border-cci-100 bg-white">
        <table className="w-full min-w-[1500px] text-left text-sm">
          <thead className="border-b border-cci-100 bg-cci-50 text-slate-600"><tr><th className="px-4 py-4">Sel.</th><th className="px-4 py-4">Participante</th><th className="px-4 py-4">Contacto</th><th className="px-4 py-4">Inscripción</th><th className="px-4 py-4">Estado</th><th className="px-4 py-4">Asistencia</th><th className="px-4 py-4">Marcación</th><th className="px-4 py-4">Actualizar / corregir</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {attendance.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-4 align-top"><Checkbox aria-label={`Seleccionar ${item.registration.person.first_names}`} form="bulk-attendance-form" name="attendance_ids" value={item.id} /></td>
                <td className="px-4 py-4 align-top"><p className="font-semibold text-cci-950">{item.registration.person.first_names} {item.registration.person.last_names}</p><Text size="sm">{item.registration.person.document_number}</Text><Text size="sm">{item.registration.company_snapshot ?? "Sin empresa"}</Text></td>
                <td className="px-4 py-4 align-top text-slate-700">{item.registration.person.email}</td>
                <td className="px-4 py-4 align-top"><p className="font-mono font-semibold">{item.registration.registration_code}</p><Text size="sm">{REGISTRATION_TYPE_LABELS[item.registration.registration_type]}</Text></td>
                <td className="px-4 py-4 align-top"><RegistrationStatusBadge status={item.registration.status} /></td>
                <td className="px-4 py-4 align-top"><AttendanceStatusBadge status={item.status} /></td>
                <td className="px-4 py-4 align-top text-slate-700"><p>{item.marked_at ? formatRegistrationDate(item.marked_at) : "Sin marcar"}</p><p>{item.notes ?? ""}</p></td>
                <td className="px-4 py-4 align-top"><form action={action} className="flex min-w-[430px] gap-2"><input name="attendance_ids" type="hidden" value={item.id} /><Select aria-label="Nuevo estado" className="w-36" defaultValue={item.status} name="status"><option value="pending">Pendiente</option><option value="attended">Asistió</option><option value="absent">No asistió</option></Select><Input aria-label="Notas" defaultValue={item.notes ?? ""} maxLength={500} name="notes" placeholder="Nota opcional" /><SubmitButton pendingLabel="Guardando…" variant="subtle">Guardar</SubmitButton></form></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
