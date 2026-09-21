import "server-only";

import { REGISTRATION_PAGE_SIZE } from "@/features/registrations/constants/registration.constants";
import { registrationSuggestionItemSchema } from "@/features/registrations/schemas/registration-suggestion.schema";
import type { RegistrationSuggestionFilters, RegistrationSuggestionItem, RegistrationSuggestionPage } from "@/features/registrations/types/registration-suggestion.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { escapePostgrestSearch } from "@/utils/postgrest-search";

const SUGGESTION_SELECT = `
  id, registration_type, participant_profile, status, created_at,
  job_title_snapshot, academic_institution_snapshot, career_snapshot,
  company_snapshot, future_topics_suggestion,
  activity:activities!inner(id, title, type, status),
  person:people!inner(document_number, first_names, last_names)
`;

function applyFilters<T extends {
  eq: (column: string, value: string) => T;
  ilike: (column: string, pattern: string) => T;
}>(query: T, filters: Omit<RegistrationSuggestionFilters, "page">): T {
  let filtered = query;
  if (filters.activityId) filtered = filtered.eq("activity_id", filters.activityId);
  if (filters.activityType) filtered = filtered.eq("activity.type", filters.activityType);
  if (filters.audience === "member") filtered = filtered.eq("registration_type", "member");
  if (filters.audience === "student") filtered = filtered.eq("participant_profile", "student");
  if (filters.audience === "professional") {
    filtered = filtered.eq("participant_profile", "professional").eq("registration_type", "general");
  }
  if (filters.query) filtered = filtered.ilike("future_topics_suggestion", `%${escapePostgrestSearch(filters.query)}%`);
  return filtered;
}

function parseItems(data: unknown[]): RegistrationSuggestionItem[] {
  return data.map((item) => {
    const parsed = registrationSuggestionItemSchema.safeParse(item);
    if (!parsed.success) throw new Error("El reporte de sugerencias no tiene el formato esperado.");
    return parsed.data;
  });
}

export async function getRegistrationSuggestions(filters: RegistrationSuggestionFilters): Promise<RegistrationSuggestionPage> {
  const client = await createServerSupabaseClient();
  const from = (filters.page - 1) * REGISTRATION_PAGE_SIZE;
  let query = client.from("registrations").select(SUGGESTION_SELECT, { count: "exact" })
    .is("deleted_at", null)
    .not("future_topics_suggestion", "is", null)
    .neq("activity.status", "archived")
    .is("person.deleted_at", null)
    .order("created_at", { ascending: false });
  query = applyFilters(query, filters);
  const { count, data, error } = await query.range(from, from + REGISTRATION_PAGE_SIZE - 1);
  if (error) throw new Error("No fue posible consultar las sugerencias.", { cause: error });
  const total = count ?? 0;
  return { items: parseItems(data ?? []), page: filters.page, pageCount: Math.max(1, Math.ceil(total / REGISTRATION_PAGE_SIZE)), total };
}

export async function getRegistrationSuggestionsForExport(filters: Omit<RegistrationSuggestionFilters, "page">): Promise<RegistrationSuggestionItem[]> {
  const client = await createServerSupabaseClient();
  let query = client.from("registrations").select(SUGGESTION_SELECT)
    .is("deleted_at", null)
    .not("future_topics_suggestion", "is", null)
    .neq("activity.status", "archived")
    .is("person.deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(5000);
  query = applyFilters(query, filters);
  const { data, error } = await query;
  if (error) throw new Error("No fue posible exportar las sugerencias.", { cause: error });
  return parseItems(data ?? []);
}
