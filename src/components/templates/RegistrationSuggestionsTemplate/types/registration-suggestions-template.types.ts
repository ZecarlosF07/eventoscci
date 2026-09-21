import type { RegistrationActivityOption } from "@/features/registrations/types/registration.types";
import type { RegistrationSuggestionFilters, RegistrationSuggestionPage } from "@/features/registrations/types/registration-suggestion.types";

export interface RegistrationSuggestionsTemplateProps {
  activities: RegistrationActivityOption[];
  data: RegistrationSuggestionPage;
  filters: RegistrationSuggestionFilters;
}
