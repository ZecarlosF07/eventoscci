import { Text } from "@/components/atoms/Text";
import { Pagination } from "@/components/molecules/Pagination";
import type { ActivitiesListTemplateProps } from "@/components/templates/ActivitiesListTemplate/types/activities-list-template.types";
import { ActivityCard } from "@/features/activities/components/ActivityCard";
import { EventCatalogIntroduction } from "@/features/activities/components/EventCatalogIntroduction/EventCatalogIntroduction";
import { EventHistorySection } from "@/features/activities/components/EventHistorySection/EventHistorySection";
import { ActivityFilters } from "@/features/activities/components/ActivityFilters";
import { CatalogHeroCarousel } from "@/features/catalog/components/CatalogHeroCarousel";
import { CatalogSectionHeader } from "@/features/catalog/components/CatalogSectionHeader/CatalogSectionHeader";
import { createActivityCarouselSlides } from "@/features/catalog/utils/catalog-carousel";

export function ActivitiesListTemplate({
  activities,
  categories,
  description,
  emptyMessage,
  eyebrow,
  featuredActivities,
  filters,
  heroTitle,
  page,
  pastEvents,
  pageCount,
  pathname,
  title,
  total,
}: ActivitiesListTemplateProps) {
  const slides = createActivityCarouselSlides(featuredActivities);
  const isEventCatalog = pastEvents !== undefined;

  return (
    <div>
      <CatalogHeroCarousel browseLabel={`Explorar ${title.toLocaleLowerCase("es-PE")}`} description={description} emptyMessage={`Descubre experiencias de ${title.toLocaleLowerCase("es-PE")} para conectar, aprender y crear nuevas oportunidades.`} eyebrow={eyebrow} slides={slides} title={heroTitle} />
      <div className="mx-auto w-full max-w-7xl scroll-mt-28 px-5 pb-14 sm:px-8 sm:pb-20" id="catalogo">
        <div className="relative z-30 px-2 pb-2 pt-3 sm:-mt-6 sm:px-5 sm:pt-0">
          <ActivityFilters categories={categories} filters={filters} />
        </div>
        {isEventCatalog ? <EventCatalogIntroduction total={total} /> : <div className="mt-6 sm:mt-8"><CatalogSectionHeader description="Elige una capacitación para conocer su programa e inscribirte." eyebrow={`${total} ${total === 1 ? "capacitación disponible" : "capacitaciones disponibles"}`} title={`Explora ${title.toLocaleLowerCase("es-PE")}`} /></div>}
        {activities.length ? (
          <section aria-label={isEventCatalog ? "Próximos encuentros" : "Capacitaciones disponibles"} className="mt-5">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {activities.map((activity) => <div className={activities.length === 1 ? "md:col-span-2 lg:col-span-3" : undefined} key={activity.id}><ActivityCard activity={activity} presentation={activities.length === 1 ? "featured" : "visual"} /></div>)}
            </div>
            {pageCount > 1 ? <div className="mt-9"><Pagination page={page} pageCount={pageCount} pathname={pathname} searchParams={{ categoria: filters.category, fecha: filters.date, modalidad: filters.modality, precio: filters.price, q: filters.query }} /></div> : null}
          </section>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-cci-200 bg-white px-6 py-8 text-center"><Text>{emptyMessage}</Text></div>
        )}
        {pastEvents ? <EventHistorySection activities={pastEvents} /> : null}
      </div>
    </div>
  );
}
