import type { AdminParticipantsPageProps, ParticipantFilters } from "@/features/participants/types/participant.types";

function firstValue(value?: string | string[]): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function parseParticipantFilters(
  searchParams: AdminParticipantsPageProps["searchParams"],
): Promise<ParticipantFilters> {
  const params = await searchParams;
  const page = Number(firstValue(params.pagina));
  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    query: firstValue(params.q)?.trim() || undefined,
  };
}
