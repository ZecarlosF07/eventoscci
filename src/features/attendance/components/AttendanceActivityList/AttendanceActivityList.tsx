import Link from "next/link";

import { Text } from "@/components/atoms/Text";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { ROUTES } from "@/constants/routes";
import type { AttendanceActivityListProps } from "@/features/attendance/components/AttendanceActivityList/types/attendance-activity-list.types";

export function AttendanceActivityList({ activities }: AttendanceActivityListProps) {
  if (!activities.length) return <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center"><Text>No hay actividades disponibles.</Text></div>;
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {activities.map((activity) => (
        <article className="flex flex-col justify-between gap-5 rounded-3xl border border-cci-100 bg-white p-6" key={activity.id}>
          <div className="space-y-2"><div className="flex items-center justify-between gap-3"><Text className="font-semibold uppercase tracking-wide" size="sm">{activity.type === "event" ? "Evento" : "Capacitación"}</Text><StatusBadge status={activity.status} /></div><h2 className="text-lg font-semibold text-cci-950">{activity.title}</h2><Text>{activity.registrationCount} inscripciones activas.</Text></div>
          <Link className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cci-950 px-4 text-sm font-semibold text-white hover:bg-cci-800" href={`${ROUTES.adminAttendance}/${activity.id}`}>Gestionar asistencia</Link>
        </article>
      ))}
    </div>
  );
}
