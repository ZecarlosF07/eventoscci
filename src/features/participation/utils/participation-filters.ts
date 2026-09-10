import type {
  ParticipationOverviewFilters,
  ParticipationOverviewPageProps,
  ParticipationPeriod,
} from "@/features/participation/types/participation.types";

function firstValue(value?: string | string[]): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function parseParticipationFilters(
  searchParams: ParticipationOverviewPageProps["searchParams"],
): Promise<ParticipationOverviewFilters> {
  const params = await searchParams;
  const page = Number(firstValue(params.pagina));
  const periodValue = firstValue(params.periodo);
  const period: ParticipationPeriod = periodValue === "past" || periodValue === "all"
    ? periodValue
    : "upcoming";
  const type = firstValue(params.tipo);

  return {
    activityType: type === "event" || type === "training" ? type : undefined,
    page: Number.isInteger(page) && page > 0 ? page : 1,
    period,
    query: firstValue(params.q)?.trim() || undefined,
  };
}
