import { ROUTES } from "@/constants/routes";
import type { EventCatalogIntroductionProps } from "@/features/activities/components/EventCatalogIntroduction/types/event-catalog-introduction.types";
import { CatalogSectionHeader } from "@/features/catalog/components/CatalogSectionHeader/CatalogSectionHeader";

export function EventCatalogIntroduction({ total }: EventCatalogIntroductionProps) {
  return (
    <section aria-labelledby="event-agenda-introduction" className="mt-6 sm:mt-8">
      <CatalogSectionHeader actionHref={ROUTES.eventHistory} actionLabel="Eventos realizados" description="Encuentros de la Cámara de Comercio de Ica. Consulta fechas, requisitos e inscripción." eyebrow={`Agenda actual · ${total} ${total === 1 ? "evento" : "eventos"}`} id="event-agenda-introduction" title="Consulta la agenda de eventos en Ica" />
    </section>
  );
}
