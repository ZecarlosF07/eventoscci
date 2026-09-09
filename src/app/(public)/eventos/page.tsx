import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ActivitiesListTemplate } from "@/components/templates/ActivitiesListTemplate";
import { ROUTES } from "@/constants/routes";
import { getFeaturedPublicActivities, getPublicActivityPage } from "@/features/activities/queries/get-public-activities";
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
    title: filters.page > 1 ? `Eventos en Ica, Perú — página ${filters.page}` : "Eventos en Ica, Perú",
  });
}

export default async function EventsPage({ searchParams }: PublicCatalogPageProps) {
  const filters = parsePublicFilters(await searchParams);
  const [result, categories, featuredActivities] = await Promise.all([
    getPublicActivityPage("event", filters),
    getPublicActiveCategories(),
    getFeaturedPublicActivities("event"),
  ]);
  if (result.page > result.pageCount) notFound();

  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: "Inicio", path: ROUTES.home },
    { name: "Eventos", path: ROUTES.events },
  ], getSiteUrl());

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <ActivitiesListTemplate activities={result.activities} categories={categories} description="Encuentros, conferencias y espacios para conectar con el ecosistema empresarial de Ica, Perú." emptyMessage="No se encontraron eventos con los filtros seleccionados." eyebrow="Agenda institucional" featuredActivities={featuredActivities} filters={filters} page={result.page} pageCount={result.pageCount} pathname={ROUTES.events} title="Eventos" total={result.total} />
    </>
  );
}
