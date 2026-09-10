import Link from "next/link";

import { OperationNotice } from "@/components/molecules/OperationNotice";
import { Pagination } from "@/components/molecules/Pagination";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import type { ActivityAttendanceTemplateProps } from "@/components/templates/ActivityAttendanceTemplate/types/activity-attendance-template.types";
import { ROUTES } from "@/constants/routes";
import { AttendanceFilters } from "@/features/attendance/components/AttendanceFilters";
import { AttendanceTable } from "@/features/attendance/components/AttendanceTable";
import { ActivityParticipationMetrics } from "@/features/participation/components/ActivityParticipationMetrics/ActivityParticipationMetrics";
import { ParticipationActivityTabs } from "@/features/participation/components/ParticipationActivityTabs/ParticipationActivityTabs";
import { getActivityAttendanceRoute } from "@/features/participation/utils/participation-routes";

export function ActivityAttendanceTemplate({ data, filters, result, summary }: ActivityAttendanceTemplateProps) {
  const values = {
    asistencia: filters.attendanceStatus,
    estado: filters.registrationStatus ?? "all",
    q: filters.query,
    tipo: filters.registrationType,
  };
  const query = new URLSearchParams(Object.entries(values).filter((item): item is [string, string] => Boolean(item[1]))).toString();
  const pathname = getActivityAttendanceRoute(data.activity.id);
  const returnTo = query ? `${pathname}?${query}` : pathname;
  const exportValues = new URLSearchParams(query);
  exportValues.set("actividad", data.activity.id);
  return (
    <div className="space-y-7">
      <Link className="text-sm font-semibold text-slate-700 hover:underline" href={ROUTES.adminRegistrations}>← Volver a actividades</Link>
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <SectionHeading description={`${data.total} participantes en la vista actual. Solo las inscripciones confirmadas pueden marcarse.`} eyebrow={data.activity.type === "event" ? "Evento" : "Capacitación"} title={data.activity.title} />
        <Link className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold hover:bg-cci-50" href={`${ROUTES.adminRegistrations}/exportar?${exportValues}`}>Exportar CSV</Link>
      </div>
      <ParticipationActivityTabs activityId={data.activity.id} current="attendance" />
      <ActivityParticipationMetrics activity={summary} mode="attendance" />
      <OperationNotice result={result} />
      <AttendanceFilters filters={filters} />
      <AttendanceTable activityId={data.activity.id} attendance={data.attendance} returnTo={returnTo} />
      <Pagination page={data.page} pageCount={data.pageCount} pathname={pathname} searchParams={values} />
    </div>
  );
}
