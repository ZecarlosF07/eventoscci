import type { ParticipationActivitySummary } from "@/features/participation/types/participation.types";
import type { RegistrationAdminFilters, RegistrationAdminPage } from "@/features/registrations/types/registration.types";

export interface ActivityRegistrationsTemplateProps {
  activity: ParticipationActivitySummary;
  data: RegistrationAdminPage;
  filters: RegistrationAdminFilters;
  result?: string;
}
