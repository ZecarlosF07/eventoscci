import Link from "next/link";

import { ACTIVITY_STATUS_LABELS, ACTIVITY_TYPE_LABELS } from "@/features/activities/constants/activity.constants";
import { formatActivityDate } from "@/features/activities/utils/activity-formatters";
import type { ParticipationActivitySummary } from "@/features/participation/types/participation.types";
import { getActivityParticipationRoute } from "@/features/participation/utils/participation-routes";

function Capacity({ activity }: { activity: ParticipationActivitySummary }) {
  const percent = activity.capacity
    ? Math.min(100, Math.round((activity.activeCount / activity.capacity) * 100))
    : 0;
  return (
    <div>
      <div className="flex justify-between text-xs font-medium text-slate-600">
        <span>Cupos activos</span><span>{activity.activeCount}{activity.capacity ? ` / ${activity.capacity}` : " · sin límite"}</span>
      </div>
      {activity.capacity ? <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-cci-lime" style={{ width: `${percent}%` }} /></div> : null}
    </div>
  );
}

export function ParticipationActivityGrid({ activities }: { activities: ParticipationActivitySummary[] }) {
  if (!activities.length) return <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600">No hay actividades con estos criterios.</div>;
  return (
    <section aria-label="Actividades" className="grid gap-4 lg:grid-cols-2">
      {activities.map((activity) => (
        <article className="group rounded-3xl border border-cci-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" key={activity.activityId}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cci-600">{ACTIVITY_TYPE_LABELS[activity.type]} · {ACTIVITY_STATUS_LABELS[activity.status]}</p>
              <h2 className="mt-2 text-xl font-bold text-cci-950">{activity.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{activity.nextDate ? formatActivityDate(activity.nextDate) : "Sin próxima fecha"}</p>
            </div>
            {activity.pendingCount > 0 ? <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">{activity.pendingCount} por verificar</span> : null}
          </div>
          <div className="my-5 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-cci-50 p-3"><strong className="block text-xl text-cci-950">{activity.activeCount}</strong><span className="text-xs text-slate-600">Activas</span></div>
            <div className="rounded-xl bg-cci-50 p-3"><strong className="block text-xl text-cci-950">{activity.confirmedCount}</strong><span className="text-xs text-slate-600">Confirmadas</span></div>
            <div className="rounded-xl bg-cci-50 p-3"><strong className="block text-xl text-cci-950">{activity.attendedCount}</strong><span className="text-xs text-slate-600">Asistieron</span></div>
          </div>
          <Capacity activity={activity} />
          <Link className="mt-5 flex min-h-11 items-center justify-center rounded-xl bg-cci-950 px-5 text-sm font-bold text-white transition group-hover:bg-cci-800" href={getActivityParticipationRoute(activity.activityId)}>Gestionar participación →</Link>
        </article>
      ))}
    </section>
  );
}
