import { ParticipantsManagementTemplate } from "@/components/templates/ParticipantsManagementTemplate";
import { getParticipants } from "@/features/participants/queries/get-participants";
import type { AdminParticipantsPageProps } from "@/features/participants/types/participant.types";
import { parseParticipantFilters } from "@/features/participants/utils/participant-filters";

export default async function AdminParticipantsPage({ searchParams }: AdminParticipantsPageProps) {
  const filters = await parseParticipantFilters(searchParams);
  const data = await getParticipants(filters);
  return <ParticipantsManagementTemplate data={data} filters={filters} />;
}
