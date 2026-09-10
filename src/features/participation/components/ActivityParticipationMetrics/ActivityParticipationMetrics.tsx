import type { ParticipationActivitySummary } from "@/features/participation/types/participation.types";

export function ActivityParticipationMetrics({ activity, mode = "registrations" }: { activity: ParticipationActivitySummary; mode?: "attendance" | "registrations" }) {
  const items = mode === "attendance" ? [
    ["Confirmadas", activity.confirmedCount],
    ["Sin marcar", activity.attendancePendingCount],
    ["Asistieron", activity.attendedCount],
    ["No asistieron", activity.absentCount],
  ] as const : [
    ["Activas", activity.activeCount],
    ["Por verificar", activity.pendingCount],
    ["Confirmadas", activity.confirmedCount],
    ["Canceladas", activity.cancelledCount],
  ] as const;
  return (
    <section aria-label="Resumen de inscripciones" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map(([label, value]) => (
        <div className="rounded-2xl border border-cci-100 bg-white p-4" key={label}>
          <strong className="block text-2xl text-cci-950">{value}</strong>
          <span className="text-xs font-medium text-slate-600">{label}</span>
        </div>
      ))}
    </section>
  );
}
