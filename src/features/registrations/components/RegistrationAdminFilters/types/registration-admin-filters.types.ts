import type { RegistrationActivityOption, RegistrationAdminFilters } from "@/features/registrations/types/registration.types";

export interface RegistrationAdminFiltersProps {
  activities: RegistrationActivityOption[];
  filters: RegistrationAdminFilters;
  showStatus: boolean;
}
