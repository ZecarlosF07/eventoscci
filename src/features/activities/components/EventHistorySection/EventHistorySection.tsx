import { ROUTES } from "@/constants/routes";
import { ActivityCard } from "@/features/activities/components/ActivityCard";
import { CatalogSectionHeader } from "@/features/catalog/components/CatalogSectionHeader/CatalogSectionHeader";
import type { EventHistorySectionProps } from "@/features/activities/components/EventHistorySection/types/event-history-section.types";

export function EventHistorySection({ activities }: EventHistorySectionProps) {
  return (
    <section aria-labelledby="past-events-title" className="mt-8 border-t border-cci-100 pt-6 sm:mt-10 sm:pt-8">
      <CatalogSectionHeader actionHref={ROUTES.eventHistory} actionLabel="Ver historial completo" description="Explora nuestros encuentros anteriores." id="past-events-title" title="Eventos realizados" />
      {activities.length ? <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{activities.map((activity) => <ActivityCard activity={activity} key={activity.id} presentation="visual" />)}</div> : <p className="mt-6 leading-7 text-slate-600">Los eventos realizados se mostrarán aquí cuando termine su última sesión.</p>}
    </section>
  );
}
