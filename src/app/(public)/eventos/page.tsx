import type { Metadata } from "next";

import { ActivitiesListTemplate } from "@/components/templates/ActivitiesListTemplate";
import type { PublicCatalogPageProps } from "@/features/activities/types/activity-page.types";
import { parsePublicFilters } from "@/features/activities/types/activity-page.types";
import { getPublicActivities } from "@/features/activities/queries/get-public-activities";
import { getActiveCategories } from "@/features/categories/queries/get-active-categories";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  description: "Próximos eventos empresariales de la Cámara de Comercio de Ica.",
  title: "Eventos",
};

export default async function EventsPage({ searchParams }: PublicCatalogPageProps) {
  const filters = parsePublicFilters(await searchParams);
  const client = await createServerSupabaseClient();
  const [activities, categories] = await Promise.all([
    getPublicActivities("event", filters),
    getActiveCategories(client),
  ]);

  return <ActivitiesListTemplate activities={activities} categories={categories} description="Encuentros, conferencias y espacios para conectar con el ecosistema empresarial de Ica." emptyMessage="No se encontraron eventos con los filtros seleccionados." eyebrow="Agenda institucional" filters={filters} title="Eventos" />;
}
