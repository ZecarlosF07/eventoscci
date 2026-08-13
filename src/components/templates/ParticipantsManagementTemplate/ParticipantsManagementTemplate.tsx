import { Pagination } from "@/components/molecules/Pagination";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import type { ParticipantsManagementTemplateProps } from "@/components/templates/ParticipantsManagementTemplate/types/participants-management-template.types";
import { ROUTES } from "@/constants/routes";
import { ParticipantFilters } from "@/features/participants/components/ParticipantFilters";
import { ParticipantsTable } from "@/features/participants/components/ParticipantsTable";

export function ParticipantsManagementTemplate({ data, filters }: ParticipantsManagementTemplateProps) {
  return (
    <div className="space-y-7">
      <SectionHeading description={`${data.total} personas institucionales encontradas, tengan o no cuenta de Campus.`} eyebrow="Identidad centralizada" title="Participantes" />
      <ParticipantFilters filters={filters} />
      <ParticipantsTable participants={data.participants} />
      <Pagination page={data.page} pageCount={data.pageCount} pathname={ROUTES.adminParticipants} searchParams={{ q: filters.query }} />
    </div>
  );
}
