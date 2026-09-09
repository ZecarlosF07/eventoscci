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
    description: "Capacitaciones empresariales en Ica y virtuales para Perú, organizadas por la Cámara de Comercio de Ica.",
    follow: true,
    index: !filtered,
    path: !filtered && filters.page > 1 ? `${ROUTES.trainings}?pagina=${filters.page}` : ROUTES.trainings,
    title: filters.page > 1 ? `Capacitaciones en Ica — página ${filters.page}` : "Capacitaciones empresariales en Ica y virtuales",
  });
}

export default async function TrainingsPage({ searchParams }: PublicCatalogPageProps) {
  const filters = parsePublicFilters(await searchParams);
  const [result, categories, featuredActivities] = await Promise.all([
    getPublicActivityPage("training", filters),
    getPublicActiveCategories(),
    getFeaturedPublicActivities("training"),
  ]);
  if (result.page > result.pageCount) notFound();

  const breadcrumbs = buildBreadcrumbJsonLd([
    { name: "Inicio", path: ROUTES.home },
    { name: "Capacitaciones", path: ROUTES.trainings },
  ], getSiteUrl());

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <ActivitiesListTemplate activities={result.activities} categories={categories} description="Talleres presenciales en Ica, Perú, y programas virtuales para el desarrollo de empresas y profesionales." emptyMessage="No se encontraron capacitaciones con los filtros seleccionados." eyebrow="Aprendizaje empresarial" featuredActivities={featuredActivities} filters={filters} heroTitle="Capacitaciones en Ica" page={result.page} pageCount={result.pageCount} pathname={ROUTES.trainings} title="Capacitaciones" total={result.total} />
    </>
  );
}
