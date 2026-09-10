import { notFound } from "next/navigation";

import { ActivityRegistrationsTemplate } from "@/components/templates/ActivityRegistrationsTemplate";
import { getParticipationActivitySummary } from "@/features/participation/queries/get-participation-overview";
import { getActivityRegistrations } from "@/features/registrations/queries/get-activity-registrations";
import type { ActivityRegistrationsPageProps } from "@/features/registrations/types/registration.types";
import { firstValue, parseActivityRegistrationFilters } from "@/features/registrations/utils/admin-registration-filters";

export default async function ActivityRegistrationsPage({ params, searchParams }: ActivityRegistrationsPageProps) {
  const { activityId } = await params;
  const filters = await parseActivityRegistrationFilters(searchParams, activityId);
  const [activity, data, query] = await Promise.all([
    getParticipationActivitySummary(activityId),
    getActivityRegistrations(filters),
    searchParams,
  ]);
  if (!activity) notFound();
  return <ActivityRegistrationsTemplate activity={activity} data={data} filters={filters} result={firstValue(query.resultado)} />;
}
