import Link from "next/link";

import type { ParticipationActivitySummary } from "@/features/participation/types/participation.types";
import type { RegistrationAdminFilters } from "@/features/registrations/types/registration.types";
import { getActivityParticipationRoute } from "@/features/participation/utils/participation-routes";

export function RegistrationStatusShortcuts({ activity, filters }: { activity: ParticipationActivitySummary; filters: RegistrationAdminFilters }) {
  const current = filters.status ?? filters.statusScope ?? "active";
  const items = [
    ["active", "Activas", activity.activeCount],
    ["pending", "Por verificar", activity.pendingCount],
    ["confirmed", "Confirmadas", activity.confirmedCount],
    ["cancelled", "Canceladas", activity.cancelledCount],
    ["all", "Historial", activity.totalCount],
  ] as const;
  const pathname = getActivityParticipationRoute(activity.activityId);
  return (
    <nav aria-label="Estados de inscripción" className="flex gap-2 overflow-x-auto pb-1">
      {items.map(([status, label, count]) => {
        const params = new URLSearchParams();
        params.set("estado", status);
        if (filters.query) params.set("q", filters.query);
        if (filters.registrationType) params.set("tipo", filters.registrationType);
        return <Link aria-current={current === status ? "page" : undefined} className={current === status ? "shrink-0 rounded-full bg-cci-950 px-4 py-2 text-sm font-bold text-white" : "shrink-0 rounded-full border border-cci-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-cci-50"} href={`${pathname}?${params}`} key={status}>{label} · {count}</Link>;
      })}
    </nav>
  );
}
