import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ActivitiesListTemplate } from "@/components/templates/ActivitiesListTemplate";
import { ROUTES } from "@/constants/routes";
import { getFeaturedPublicActivities, getPublicActivityPage } from "@/features/activities/queries/get-public-activities";
import { getPublicEventPage } from "@/features/activities/queries/get-public-event-page";
import type { PublicCatalogPageProps } from "@/features/activities/types/activity-page.types";
import { hasPublicActivityFilters, parsePublicFilters } from "@/features/activities/types/activity-page.types";
import { getPublicActiveCategories } from "@/features/categories/queries/get-active-categories";
import { JsonLd } from "@/features/seo/components/JsonLd";
import { buildPageMetadata } from "@/features/seo/services/build-page-metadata";
import { buildBreadcrumbJsonLd } from "@/features/seo/utils/json-ld";
import { getSiteUrl } from "@/lib/env/server-env";

export async function generateMetadata({ searchParams }: PublicCatalogPageProps): Promise<Metadata> {
  const filters = parsePublicFilters(await searchParams);
  const filtered = hasPublicActivityFilters(filters);
  return buildPageMetadata({
    description: "Consulta la agenda de eventos en Ica, Perú: encuentros, conferencias y actividades de la Cámara de Comercio de Ica.",
    follow: true,
    index: !filtered,
    path: !filtered && filters.page > 1 ? `${ROUTES.events}?pagina=${filters.page}` : ROUTES.events,
    title: filters.page > 1 ? `Eventos en Ica — página ${filters.page}` : "Eventos en Ica: agenda y próximos encuentros",
  });
}

export default async function EventsPage({ searchParams }: PublicCatalogPageProps) {
  const filters = parsePublicFilters(await searchParams);
  const [result, categories, featuredActivities, history] = await Promise.all([
    getPublicActivityPage("event", filters),
    getPublicActiveCategories(),
    getFeaturedPublicActivities("event"),
    getPublicEventPage("past", { page: 1 }, 6),
  ]);
  if (result.page > result.pageCount) notFound();

  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: "Inicio", path: ROUTES.home },
    { name: "Eventos", path: ROUTES.events },
  ], getSiteUrl());

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <ActivitiesListTemplate pastEvents={history.activities} activities={result.activities} categories={categories} description="Encuentros, conferencias y espacios para conectar con el ecosistema empresarial de Ica, Perú." emptyMessage={hasPublicActivityFilters(filters) ? "No se encontraron eventos con los filtros seleccionados." : "La nueva agenda se publicará pronto. Mientras tanto, puedes consultar los eventos realizados."} eyebrow="Agenda institucional" featuredActivities={featuredActivities} filters={filters} heroTitle="Eventos en Ica, Perú" page={result.page} pageCount={result.pageCount} pathname={ROUTES.events} title="Eventos" total={result.total} />
    </>
  );
}
