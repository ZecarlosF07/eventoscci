import { ActivityAdminListTemplate } from "@/components/templates/ActivityAdminListTemplate";
import { getAdminActivities } from "@/features/activities/queries/get-admin-activities";
import type { AdminActivityListPageProps } from "@/features/activities/types/activity-page.types";
import { parseAdminFilters } from "@/features/activities/types/activity-page.types";

export default async function AdminTrainingsPage({ searchParams }: AdminActivityListPageProps) {
  const filters = parseAdminFilters(await searchParams, "training");
  const data = await getAdminActivities(filters);
  return <ActivityAdminListTemplate data={data} filters={filters} title="Capacitaciones" type="training" />;
}
