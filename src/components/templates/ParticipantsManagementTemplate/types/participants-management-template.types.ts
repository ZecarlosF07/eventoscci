import type { ParticipantFilters, ParticipantPage } from "@/features/participants/types/participant.types";

export interface ParticipantsManagementTemplateProps {
  data: ParticipantPage;
  filters: ParticipantFilters;
}
