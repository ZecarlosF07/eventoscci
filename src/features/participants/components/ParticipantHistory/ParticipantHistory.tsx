import Link from "next/link";

import { Text } from "@/components/atoms/Text";
import { AttendanceStatusBadge } from "@/features/attendance/components/AttendanceStatusBadge";
import type { ParticipantHistoryProps } from "@/features/participants/components/ParticipantHistory/types/participant-history.types";
import { RegistrationStatusBadge } from "@/features/registrations/components/RegistrationStatusBadge";
import { REGISTRATION_TYPE_LABELS } from "@/features/registrations/constants/registration.constants";
import { formatRegistrationDate, formatRegistrationPrice } from "@/features/registrations/utils/registration-formatters";

export function ParticipantHistory({ history }: ParticipantHistoryProps) {
  if (!history.length) return <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center"><Text>Este participante todavía no registra actividades.</Text></div>;
  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
      <table className="w-full min-w-[1050px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-slate-600"><tr><th className="px-5 py-4">Actividad</th><th className="px-5 py-4">Código</th><th className="px-5 py-4">Registro</th><th className="px-5 py-4">Snapshots</th><th className="px-5 py-4">Estado</th><th className="px-5 py-4">Asistencia</th></tr></thead>
        <tbody className="divide-y divide-slate-100">
          {history.map((item) => (
            <tr key={item.id}>
              <td className="px-5 py-4"><Link className="font-semibold text-slate-950 hover:underline" href={`/admin/asistencia/${item.activity.id}`}>{item.activity.title}</Link><Text size="sm">{item.activity.type === "event" ? "Evento" : "Capacitación"}</Text></td>
              <td className="px-5 py-4 font-mono">{item.registration_code}</td>
              <td className="px-5 py-4 text-slate-700"><p>{REGISTRATION_TYPE_LABELS[item.registration_type]}</p><p>{formatRegistrationDate(item.created_at)}</p></td>
              <td className="px-5 py-4 text-slate-700"><p>{item.company_snapshot ?? "Sin empresa"}</p><p>{item.ruc_snapshot ?? "Sin RUC"}</p><p>{formatRegistrationPrice(item.price_snapshot)}</p></td>
              <td className="px-5 py-4"><RegistrationStatusBadge status={item.status} /></td>
              <td className="px-5 py-4"><AttendanceStatusBadge status={item.attendance[0]?.status ?? "pending"} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
