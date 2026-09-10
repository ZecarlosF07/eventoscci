import { ParticipationOverviewTemplate } from "@/components/templates/ParticipationOverviewTemplate";
import {
  getParticipationGlobalMetrics,
  getParticipationOverview,
} from "@/features/participation/queries/get-participation-overview";
import type { ParticipationOverviewPageProps } from "@/features/participation/types/participation.types";
import { parseParticipationFilters } from "@/features/participation/utils/participation-filters";

export default async function AdminRegistrationsPage({ searchParams }: ParticipationOverviewPageProps) {
  const filters = await parseParticipationFilters(searchParams);
  const [data, metrics] = await Promise.all([
    getParticipationOverview(filters),
    getParticipationGlobalMetrics(),
  ]);
  return <ParticipationOverviewTemplate data={data} filters={filters} metrics={metrics} />;
}
