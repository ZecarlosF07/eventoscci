import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { ActivityCard } from "@/features/activities/components/ActivityCard";
import type { EventHistorySectionProps } from "@/features/activities/components/EventHistorySection/types/event-history-section.types";

export function EventHistorySection({ activities }: EventHistorySectionProps) {
  return (
    <section aria-labelledby="past-events-title" className="mt-14 border-t border-cci-100 pt-10 sm:mt-16 sm:pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cci-600">Nuestra trayectoria</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-cci-950 sm:text-3xl" id="past-events-title">Eventos realizados</h2>
          <p className="mt-3 max-w-2xl leading-7 text-slate-700">Revisa las fechas, temas y participantes invitados de nuestros encuentros anteriores.</p>
        </div>
        <Link className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-cci-200 px-4 py-2 text-sm font-semibold text-cci-800 transition hover:border-cci-500 hover:bg-cci-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cci-800" href={ROUTES.eventHistory}>Ver historial completo <span aria-hidden="true">→</span></Link>
      </div>
      {activities.length ? <div className="mt-7 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{activities.map((activity) => <ActivityCard activity={activity} key={activity.id} />)}</div> : <p className="mt-6 leading-7 text-slate-600">Los eventos realizados se mostrarán aquí cuando termine su última sesión.</p>}
    </section>
  );
}
