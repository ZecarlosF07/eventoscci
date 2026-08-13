import Link from "next/link";

import { OperationNotice } from "@/components/molecules/OperationNotice";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import type { ActivityAttendanceTemplateProps } from "@/components/templates/ActivityAttendanceTemplate/types/activity-attendance-template.types";
import { ROUTES } from "@/constants/routes";
import { AttendanceFilters } from "@/features/attendance/components/AttendanceFilters";
import { AttendanceTable } from "@/features/attendance/components/AttendanceTable";

export function ActivityAttendanceTemplate({ data, filters, result }: ActivityAttendanceTemplateProps) {
  const values = {
    asistencia: filters.attendanceStatus,
    estado: filters.registrationStatus,
    q: filters.query,
    tipo: filters.registrationType,
  };
  const query = new URLSearchParams(Object.entries(values).filter((item): item is [string, string] => Boolean(item[1]))).toString();
  const pathname = `${ROUTES.adminAttendance}/${data.activity.id}`;
  const returnTo = query ? `${pathname}?${query}` : pathname;
  const exportValues = new URLSearchParams(query);
  exportValues.set("actividad", data.activity.id);
  return (
    <div className="space-y-7">
      <div><Link className="text-sm font-semibold text-slate-700 hover:underline" href={ROUTES.adminAttendance}>← Elegir otra actividad</Link></div>
      <SectionHeading description={`${data.attendance.length} registros en el contexto filtrado. Los preinscritos se muestran diferenciados de los confirmados.`} eyebrow={data.activity.type === "event" ? "Evento" : "Capacitación"} title={data.activity.title} />
      <OperationNotice result={result} />
      <AttendanceFilters filters={filters} />
      <div className="flex justify-end"><Link className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50" href={`${ROUTES.adminRegistrations}/exportar?${exportValues}`}>Exportar CSV filtrado</Link></div>
      <AttendanceTable activityId={data.activity.id} attendance={data.attendance} returnTo={returnTo} />
    </div>
  );
}
