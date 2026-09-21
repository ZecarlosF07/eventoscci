import type { RegistrationSuggestionsPageProps, RegistrationSuggestionFilters } from "@/features/registrations/types/registration-suggestion.types";

function firstValue(value?: string | string[]): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export async function parseRegistrationSuggestionFilters(
  searchParams: RegistrationSuggestionsPageProps["searchParams"],
): Promise<RegistrationSuggestionFilters> {
  const params = await searchParams;
  const page = Number.parseInt(firstValue(params.pagina) ?? "1", 10);
  const activityType = firstValue(params.tipo);
  const audience = firstValue(params.perfil);

  return {
    activityId: firstValue(params.actividad) || undefined,
    activityType: activityType === "event" || activityType === "training" ? activityType : undefined,
    audience: audience === "professional" || audience === "student" || audience === "member" ? audience : "all",
    page: Number.isFinite(page) && page > 0 ? page : 1,
    query: firstValue(params.q)?.trim() || undefined,
  };
}
