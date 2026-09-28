import type { RegistrationSuggestionFilters } from "@/features/registrations/types/registration-suggestion.types";
import type { RegistrationActivityOption } from "@/features/registrations/types/registration.types";

export interface RegistrationSuggestionFiltersProps { total?: number;
  activities: RegistrationActivityOption[];
  filters: RegistrationSuggestionFilters;
}
