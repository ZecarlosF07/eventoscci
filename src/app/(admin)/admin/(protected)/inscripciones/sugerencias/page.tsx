import { RegistrationSuggestionsTemplate } from "@/components/templates/RegistrationSuggestionsTemplate";
import { getRegistrationActivityOptions } from "@/features/registrations/queries/get-activity-registrations";
import { getRegistrationSuggestions } from "@/features/registrations/queries/get-registration-suggestions";
import type { RegistrationSuggestionsPageProps } from "@/features/registrations/types/registration-suggestion.types";
import { parseRegistrationSuggestionFilters } from "@/features/registrations/utils/registration-suggestion-filters";

export default async function RegistrationSuggestionsPage({ searchParams }: RegistrationSuggestionsPageProps) {
  const filters = await parseRegistrationSuggestionFilters(searchParams);
  const [data, activities] = await Promise.all([
    getRegistrationSuggestions(filters),
    getRegistrationActivityOptions(),
  ]);
  return <RegistrationSuggestionsTemplate activities={activities} data={data} filters={filters} />;
}
