import { Checkbox } from "@/components/atoms/Checkbox";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { SubmitButton } from "@/components/atoms/SubmitButton";
import { Text } from "@/components/atoms/Text";
import { ResponsiveTableFrame } from "@/components/molecules/ResponsiveTableFrame";
import { AttendanceStatusBadge } from "@/features/attendance/components/AttendanceStatusBadge";
import { AttendanceRowForm } from "@/features/attendance/components/AttendanceTable/AttendanceRowForm";
import type { AttendanceTableProps } from "@/features/attendance/components/AttendanceTable/types/attendance-table.types";
import { updateAttendanceAction } from "@/features/attendance/mutations/attendance.actions";
import type { AttendanceItem } from "@/features/attendance/types/attendance.types";
import { RegistrationStatusBadge } from "@/features/registrations/components/RegistrationStatusBadge";
import { CertificateRequestAdminStatus } from "@/features/registrations/components/CertificateRequestAdminStatus";
import { formatRegistrationDate } from "@/features/registrations/utils/registration-formatters";

function Participant({ item }: { item: AttendanceItem }) {
  return <div><p className="font-bold text-cci-950">{item.registration.person.first_names} {item.registration.person.last_names}</p><Text size="sm">{item.registration.person.document_number} · {item.registration.person.email}</Text><Text size="sm">{item.registration.person.phone}</Text></div>;
}

function BulkForm({ action }: { action: (formData: FormData) => void }) {
  return (
    <form action={action} className="grid gap-3 rounded-2xl border border-cci-100 bg-white p-4 md:grid-cols-[1fr_2fr_auto]" id="bulk-attendance-form">
      <Select aria-label="Estado masivo" defaultValue="attended" name="status"><option value="attended">Marcar asistieron</option><option value="absent">Marcar no asistieron</option><option value="pending">Devolver a pendiente</option></Select>
      <Input aria-label="Nota masiva" maxLength={500} name="notes" placeholder="Nota opcional para los seleccionados" />
      <SubmitButton pendingLabel="Aplicando…">Aplicar a seleccionados</SubmitButton>
    </form>
  );
}

function MobileCards({ activityId, attendance, returnTo }: AttendanceTableProps) {
  return <div className="space-y-3 md:hidden">{attendance.map((item) => <article className="rounded-2xl border border-cci-100 bg-white p-4" key={item.id}>
    <div className="flex items-start justify-between gap-3"><Participant item={item} /><Checkbox aria-label={`Seleccionar ${item.registration.person.first_names}`} disabled={item.registration.status !== "confirmed"} form="bulk-attendance-form" name="attendance_ids" value={item.id} /></div>
    <div className="mt-4 flex flex-wrap gap-2"><RegistrationStatusBadge status={item.registration.status} /><AttendanceStatusBadge status={item.status} /></div>
    <p className="mt-3 text-xs text-slate-500">{item.marked_at ? `Marcado ${formatRegistrationDate(item.marked_at)}` : "Aún sin marcación"}</p>
    <div className="mt-4 border-t border-slate-100 pt-4"><CertificateRequestAdminStatus registration={item.registration} returnTo={returnTo} /></div>
    <div className="mt-4 border-t border-slate-100 pt-4"><AttendanceRowForm activityId={activityId} item={item} returnTo={returnTo} /></div>
  </article>)}</div>;
}

export function AttendanceTable({ activityId, attendance, returnTo }: AttendanceTableProps) {
  if (!attendance.length) return <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center"><Text>No hay participantes con los filtros seleccionados.</Text></div>;
  const action = updateAttendanceAction.bind(null, activityId, returnTo);
  return (
    <div className="space-y-4">
      {attendance.some((item) => item.registration.status === "confirmed") ? <BulkForm action={action} /> : null}
      <MobileCards activityId={activityId} attendance={attendance} returnTo={returnTo} />
      <ResponsiveTableFrame className="hidden rounded-3xl md:block" label="Control de asistencia">
        <table className="w-full min-w-[1280px] text-left text-sm">
          <thead className="border-b border-cci-100 bg-cci-50 text-slate-600"><tr><th className="px-4 py-4">Sel.</th><th className="px-4 py-4">Participante</th><th className="px-4 py-4">Inscripción</th><th className="px-4 py-4">Asistencia</th><th className="px-4 py-4">Certificado</th><th className="px-4 py-4">Marcación</th><th className="px-4 py-4">Actualizar</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{attendance.map((item) => <tr className="hover:bg-cci-50/50" key={item.id}>
            <td className="px-4 py-4 align-top"><Checkbox aria-label={`Seleccionar ${item.registration.person.first_names}`} disabled={item.registration.status !== "confirmed"} form="bulk-attendance-form" name="attendance_ids" value={item.id} /></td>
            <td className="px-4 py-4 align-top"><Participant item={item} /></td>
            <td className="px-4 py-4 align-top"><p className="font-mono font-semibold">{item.registration.registration_code}</p><RegistrationStatusBadge status={item.registration.status} /></td>
            <td className="px-4 py-4 align-top"><AttendanceStatusBadge status={item.status} /></td>
            <td className="px-4 py-4 align-top"><CertificateRequestAdminStatus registration={item.registration} returnTo={returnTo} /></td>
            <td className="px-4 py-4 align-top text-slate-600">{item.marked_at ? formatRegistrationDate(item.marked_at) : "Sin marcar"}</td>
            <td className="px-4 py-4 align-top"><AttendanceRowForm activityId={activityId} item={item} returnTo={returnTo} /></td>
          </tr>)}</tbody>
        </table>
      </ResponsiveTableFrame>
    </div>
  );
}
