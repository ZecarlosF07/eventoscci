import type { ParticipationGlobalMetrics } from "@/features/participation/types/participation.types";

interface ParticipationMetricsProps {
  metrics: ParticipationGlobalMetrics;
}

const ITEMS: Array<{ key: keyof ParticipationGlobalMetrics; label: string; detail: string }> = [
  { detail: "Pendientes y confirmadas", key: "active", label: "Inscripciones activas" },
  { detail: "Requieren validación", key: "pending", label: "Pagos por verificar" },
  { detail: "Con cupo confirmado", key: "confirmed", label: "Confirmadas" },
  { detail: "Marcadas en asistencia", key: "attended", label: "Asistieron" },
];

export function ParticipationMetrics({ metrics }: ParticipationMetricsProps) {
  return (
    <section aria-label="Indicadores de participación" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {ITEMS.map((item) => (
        <article className="rounded-2xl border border-cci-100 bg-white p-5 shadow-sm" key={item.key}>
          <p className="text-sm font-semibold text-slate-600">{item.label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-cci-950">{metrics[item.key]}</p>
          <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
        </article>
      ))}
    </section>
  );
}
