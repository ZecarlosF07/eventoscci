import { Text } from "@/components/atoms/Text";
import { ResponsiveTableFrame } from "@/components/molecules/ResponsiveTableFrame";
import { SelectionCheckbox } from "@/features/admin-filters/components/SelectionWorkspace";
import { AttendanceStatusBadge } from "@/features/attendance/components/AttendanceStatusBadge";
import { AttendanceBulkForm } from "@/features/attendance/components/AttendanceTable/AttendanceBulkForm";
import { AttendanceRowForm } from "@/features/attendance/components/AttendanceTable/AttendanceRowForm";
import type { AttendanceParticipantProps, AttendanceTableProps } from "@/features/attendance/components/AttendanceTable/types/attendance-table.types";
import { CertificateRequestAdminStatus } from "@/features/registrations/components/CertificateRequestAdminStatus";
import { RegistrationStatusBadge } from "@/features/registrations/components/RegistrationStatusBadge";
import { formatRegistrationDate } from "@/features/registrations/utils/registration-formatters";

function Participant({ item }: AttendanceParticipantProps) {
  return <div className="break-words"><p className="font-bold text-cci-950">{item.registration.person.first_names} {item.registration.person.last_names}</p><Text size="sm">{item.registration.person.document_number} · {item.registration.person.email}</Text><Text size="sm">{item.registration.person.phone}</Text></div>;
}

function MobileCards({ activityId, attendance, returnTo }: AttendanceTableProps) {
  return <div className="space-y-3 lg:hidden">{attendance.map((item) => <article className="rounded-2xl border border-cci-100 bg-white p-4" key={item.id}>
    <div className="flex items-start justify-between gap-3"><Participant item={item} /><SelectionCheckbox item={{ id: item.id, name: `${item.registration.person.first_names} ${item.registration.person.last_names}` }} disabled={item.registration.status !== "confirmed"} /></div>
    <div className="mt-4 flex flex-wrap gap-2"><RegistrationStatusBadge status={item.registration.status} /><AttendanceStatusBadge status={item.status} /></div>
    <p className="mt-3 text-xs text-slate-500">{item.marked_at ? `Marcado ${formatRegistrationDate(item.marked_at)}` : "Aún sin marcación"}</p>
    {item.registration.certificate_mode_snapshot !== "none" || item.registration.certificate.length ? <div className="mt-3"><CertificateRequestAdminStatus registration={item.registration} returnTo={returnTo} /></div> : null}
    <div className="mt-4 border-t border-slate-100 pt-4"><AttendanceRowForm activityId={activityId} item={item} returnTo={returnTo} /></div>
  </article>)}</div>;
}

export function AttendanceTable({ activityId, attendance, returnTo }: AttendanceTableProps) {
  const visibleIds = attendance.map((item) => item.id);
  if (!attendance.length) return <div className="space-y-3"><AttendanceBulkForm activityId={activityId} visibleIds={[]} /><div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center"><Text>No hay participantes con los filtros seleccionados.</Text></div></div>;
  return (
    <div className="space-y-3">
      <AttendanceBulkForm activityId={activityId} visibleIds={visibleIds} />
      <MobileCards activityId={activityId} attendance={attendance} returnTo={returnTo} />
      <ResponsiveTableFrame className="hidden rounded-3xl lg:block" label="Control de asistencia">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="border-b border-cci-100 bg-cci-50 text-slate-600"><tr><th className="px-3 py-3">Sel.</th><th className="px-3 py-3">Participante</th><th className="px-3 py-3">Inscripción / certificado</th><th className="px-3 py-3">Asistencia</th><th className="px-3 py-3">Actualizar</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{attendance.map((item) => <tr className="hover:bg-cci-50/50" key={item.id}>
            <td className="px-3 py-3 align-top"><SelectionCheckbox item={{ id: item.id, name: `${item.registration.person.first_names} ${item.registration.person.last_names}` }} disabled={item.registration.status !== "confirmed"} /></td>
            <td className="min-w-52 px-3 py-3 align-top"><Participant item={item} /></td>
            <td className="px-3 py-3 align-top"><p className="font-mono font-semibold">{item.registration.registration_code}</p><RegistrationStatusBadge status={item.registration.status} />
              {item.registration.certificate_mode_snapshot !== "none" || item.registration.certificate.length ? <div className="mt-2"><CertificateRequestAdminStatus registration={item.registration} returnTo={returnTo} /></div> : null}
            </td>
            <td className="px-3 py-3 align-top"><AttendanceStatusBadge status={item.status} /><p className="mt-1 text-xs text-slate-600">{item.marked_at ? formatRegistrationDate(item.marked_at) : "Sin marcar"}</p></td>
            <td className="px-3 py-3 align-top"><AttendanceRowForm activityId={activityId} item={item} returnTo={returnTo} /></td>
          </tr>)}</tbody>
        </table>
      </ResponsiveTableFrame>
    </div>
  );
}
