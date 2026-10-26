import { ParticipantsManagementTemplate } from "@/components/templates/ParticipantsManagementTemplate";
import { getParticipants } from "@/features/participants/queries/get-participants";
import type { AdminParticipantsPageProps } from "@/features/participants/types/participant.types";
import { parseParticipantFilters } from "@/features/participants/utils/participant-filters";

export default async function AdminParticipantsPage({ searchParams }: AdminParticipantsPageProps) {
  const filters = await parseParticipantFilters(searchParams);
  const data = await getParticipants(filters);
  return <><div className="mb-5 flex justify-end"><a download className="inline-flex min-h-11 items-center rounded-xl border border-cci-200 px-4 py-2 text-sm font-semibold text-cci-950 hover:bg-cci-50" href="/admin/participantes/publicidad/exportar">Exportar contactos con autorización de publicidad</a></div><ParticipantsManagementTemplate data={data} filters={filters} /></>;
}
