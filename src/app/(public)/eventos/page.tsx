import type { Metadata } from "next";

import { ActivitiesListTemplate } from "@/components/templates/ActivitiesListTemplate";
import { ROUTES } from "@/constants/routes";
import { getPublicActivities } from "@/features/activities/queries/get-public-activities";
import type { PublicCatalogPageProps } from "@/features/activities/types/activity-page.types";
import { hasPublicActivityFilters, parsePublicFilters } from "@/features/activities/types/activity-page.types";
import { getActiveCategories } from "@/features/categories/queries/get-active-categories";
import { JsonLd } from "@/features/seo/components/JsonLd";
import { buildPageMetadata } from "@/features/seo/services/build-page-metadata";
import { buildBreadcrumbJsonLd } from "@/features/seo/utils/json-ld";
import { getSiteUrl } from "@/lib/env/server-env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = buildPageMetadata({
  description: "Consulta la agenda de eventos en Ica, Perú: encuentros, conferencias y actividades de la Cámara de Comercio de Ica.",
  path: ROUTES.events,
  title: "Eventos en Ica, Perú",
});

export default async function EventsPage({ searchParams }: PublicCatalogPageProps) {
  const filters = parsePublicFilters(await searchParams);
  const client = await createServerSupabaseClient();
  const activitiesPromise = getPublicActivities("event", filters);
  const featuredPromise = hasPublicActivityFilters(filters)
    ? getPublicActivities("event", {})
    : activitiesPromise;
  const [activities, categories, featuredActivities] = await Promise.all([
    activitiesPromise,
    getActiveCategories(client),
    featuredPromise,
  ]);

  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: "Inicio", path: ROUTES.home },
    { name: "Eventos", path: ROUTES.events },
  ], getSiteUrl());

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <ActivitiesListTemplate activities={activities} categories={categories} description="Encuentros, conferencias y espacios para conectar con el ecosistema empresarial de Ica, Perú." emptyMessage="No se encontraron eventos con los filtros seleccionados." eyebrow="Agenda institucional" featuredActivities={featuredActivities} filters={filters} title="Eventos" />
    </>
  );
}
