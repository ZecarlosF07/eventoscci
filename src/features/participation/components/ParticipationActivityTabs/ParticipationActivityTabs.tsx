import Link from "next/link";

import {
  getActivityAttendanceRoute,
  getActivityParticipationRoute,
} from "@/features/participation/utils/participation-routes";

export function ParticipationActivityTabs({ activityId, current }: { activityId: string; current: "attendance" | "registrations" }) {
  const items = [
    { href: getActivityParticipationRoute(activityId), id: "registrations", label: "Inscripciones" },
    { href: getActivityAttendanceRoute(activityId), id: "attendance", label: "Asistencia" },
  ] as const;
  return (
    <nav aria-label="Gestión de la actividad" className="flex gap-1 rounded-2xl bg-cci-50 p-1">
      {items.map((item) => (
        <Link
          aria-current={current === item.id ? "page" : undefined}
          className={current === item.id ? "flex-1 rounded-xl bg-cci-950 px-4 py-3 text-center text-sm font-bold text-white" : "flex-1 rounded-xl px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-white"}
          href={item.href}
          key={item.id}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
