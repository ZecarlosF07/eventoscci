import type { Metadata } from "next";

import { ActivitiesListTemplate } from "@/components/templates/ActivitiesListTemplate";
import { getPublicActivities } from "@/features/activities/queries/get-public-activities";
import type { PublicCatalogPageProps } from "@/features/activities/types/activity-page.types";
import { parsePublicFilters } from "@/features/activities/types/activity-page.types";
import { getActiveCategories } from "@/features/categories/queries/get-active-categories";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  description: "Capacitaciones para fortalecer capacidades empresariales en Ica.",
  title: "Capacitaciones",
};

export default async function TrainingsPage({ searchParams }: PublicCatalogPageProps) {
  const filters = parsePublicFilters(await searchParams);
  const client = await createServerSupabaseClient();
  const [activities, categories] = await Promise.all([
    getPublicActivities("training", filters),
    getActiveCategories(client),
  ]);

  return <ActivitiesListTemplate activities={activities} categories={categories} description="Talleres y programas prácticos para el desarrollo de empresas y profesionales." emptyMessage="No se encontraron capacitaciones con los filtros seleccionados." eyebrow="Aprendizaje empresarial" filters={filters} title="Capacitaciones" />;
}
