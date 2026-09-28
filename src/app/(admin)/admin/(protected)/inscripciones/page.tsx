import { redirect } from "next/navigation";

import { ParticipationOverviewTemplate } from "@/components/templates/ParticipationOverviewTemplate";
import {
  getParticipationGlobalMetrics,
  getParticipationOverview,
} from "@/features/participation/queries/get-participation-overview";
import type { ParticipationOverviewPageProps } from "@/features/participation/types/participation.types";
import { parseParticipationFilters } from "@/features/participation/utils/participation-filters";

export default async function AdminRegistrationsPage({ searchParams }: ParticipationOverviewPageProps) {
  const params = await searchParams;
  const legacyPeriod = Array.isArray(params.periodo) ? params.periodo[0] : params.periodo;
  if (legacyPeriod === "payments") {
    const canonical = new URLSearchParams();
    for (const [name, value] of Object.entries(params)) {
      const first = Array.isArray(value) ? value[0] : value;
      if (first) canonical.set(name, first);
    }
    canonical.set("periodo", "all");
    canonical.set("pagos", "1");
    redirect(`/admin/inscripciones?${canonical}`);
  }
  const filters = await parseParticipationFilters(Promise.resolve(params));
  const [data, metrics] = await Promise.all([
    getParticipationOverview(filters),
    getParticipationGlobalMetrics(),
  ]);
  return <ParticipationOverviewTemplate data={data} filters={filters} metrics={metrics} />;
}
