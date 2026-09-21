import type { RegistrationActivityOption } from "@/features/registrations/types/registration.types";
import type { RegistrationSuggestionFilters } from "@/features/registrations/types/registration-suggestion.types";

export interface RegistrationSuggestionFiltersProps {
  activities: RegistrationActivityOption[];
  filters: RegistrationSuggestionFilters;
}
