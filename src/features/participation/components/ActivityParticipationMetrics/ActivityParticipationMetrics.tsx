import type { ActivityParticipationMetricsProps } from "@/features/participation/components/ActivityParticipationMetrics/types/activity-participation-metrics.types";

export function ActivityParticipationMetrics({ activity, mode = "registrations", compact = false }: ActivityParticipationMetricsProps) {
  const items = mode === "attendance" ? [
    ["Confirmadas", activity.confirmedCount],
    ["Sin marcar", activity.attendancePendingCount],
    ["Asistieron", activity.attendedCount],
    ["No asistieron", activity.absentCount],
  ] as const : [
    ["Activas", activity.activeCount],
    ["Plazas pendientes", activity.pendingCount],
    ["Confirmadas", activity.confirmedCount],
    ["Canceladas", activity.cancelledCount],
  ] as const;
  return (
    <section aria-label={mode === "attendance" ? "Resumen de asistencia" : "Resumen de inscripciones"} className={compact ? "grid grid-cols-2 gap-x-5 gap-y-2 rounded-xl border border-cci-100 bg-white px-3 py-2 sm:grid-cols-4" : "grid grid-cols-2 gap-3 lg:grid-cols-4"}>
      {items.map(([label, value]) => (
        <div className={compact ? "flex items-center gap-2 sm:justify-center" : "rounded-2xl border border-cci-100 bg-white p-4"} key={label}>
          <strong className={compact ? "text-lg text-cci-950" : "block text-2xl text-cci-950"}>{value}</strong>
          <span className={compact ? "text-sm text-slate-600" : "text-xs font-medium text-slate-600"}>{label}</span>
        </div>
      ))}
    </section>
  );
}
