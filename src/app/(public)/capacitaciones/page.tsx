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
  description: "Capacitaciones empresariales en Ica y virtuales para Perú, organizadas por la Cámara de Comercio de Ica.",
  path: ROUTES.trainings,
  title: "Capacitaciones empresariales en Ica y virtuales",
});

export default async function TrainingsPage({ searchParams }: PublicCatalogPageProps) {
  const filters = parsePublicFilters(await searchParams);
  const client = await createServerSupabaseClient();
  const activitiesPromise = getPublicActivities("training", filters);
  const featuredPromise = hasPublicActivityFilters(filters)
    ? getPublicActivities("training", {})
    : activitiesPromise;
  const [activities, categories, featuredActivities] = await Promise.all([
    activitiesPromise,
    getActiveCategories(client),
    featuredPromise,
  ]);

  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: "Inicio", path: ROUTES.home },
    { name: "Capacitaciones", path: ROUTES.trainings },
  ], getSiteUrl());

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <ActivitiesListTemplate activities={activities} categories={categories} description="Talleres presenciales en Ica, Perú, y programas virtuales para el desarrollo de empresas y profesionales." emptyMessage="No se encontraron capacitaciones con los filtros seleccionados." eyebrow="Aprendizaje empresarial" featuredActivities={featuredActivities} filters={filters} title="Capacitaciones" />
    </>
  );
}
