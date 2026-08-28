import { Text } from "@/components/atoms/Text";
import type { ActivitiesListTemplateProps } from "@/components/templates/ActivitiesListTemplate/types/activities-list-template.types";
import { ActivityCard } from "@/features/activities/components/ActivityCard";
import { ActivityFilters } from "@/features/activities/components/ActivityFilters";
import { CatalogHeroCarousel } from "@/features/catalog/components/CatalogHeroCarousel";
import { createActivityCarouselSlides } from "@/features/catalog/utils/catalog-carousel";

export function ActivitiesListTemplate({
  activities,
  categories,
  description,
  emptyMessage,
  eyebrow,
  featuredActivities,
  filters,
  title,
}: ActivitiesListTemplateProps) {
  const slides = createActivityCarouselSlides(featuredActivities);

  return (
    <div>
      <CatalogHeroCarousel description={description} emptyMessage={`La nueva agenda de ${title.toLocaleLowerCase("es-PE")} se está preparando.`} eyebrow={eyebrow} slides={slides} title={title} />
      <div className="mx-auto w-full max-w-7xl px-5 pb-14 sm:px-8 sm:pb-20">
        <div className="relative z-30 -mt-4 px-2 sm:px-5">
          <ActivityFilters categories={categories} filters={filters} />
        </div>
        {activities.length ? (
          <section className="mt-12">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-cci-600">Agenda CCI</p><h2 className="mt-2 text-2xl font-bold tracking-tight text-cci-950 sm:text-3xl">Explora {title.toLocaleLowerCase("es-PE")}</h2></div>
              <Text size="sm">{activities.length} {activities.length === 1 ? "actividad disponible" : "actividades disponibles"}</Text>
            </div>
            <div className="mt-7 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activities.map((activity) => <ActivityCard activity={activity} key={activity.id} />)}
            </div>
          </section>
        ) : (
          <div className="mt-10 rounded-3xl border border-dashed border-cci-200 bg-white px-6 py-16 text-center"><Text>{emptyMessage}</Text></div>
        )}
      </div>
    </div>
  );
}
