import "server-only";

import { PARTICIPANT_PAGE_SIZE } from "@/features/participants/constants/participant.constants";
import { participantListItemSchema } from "@/features/participants/schemas/participant-query.schema";
import type { ParticipantFilters, ParticipantListItem, ParticipantPage } from "@/features/participants/types/participant.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { escapePostgrestSearch } from "@/utils/postgrest-search";

const PARTICIPANT_SELECT = `
  id, document_type, document_number, first_names, last_names, email, phone,
  job_title, company, ruc, registrations(id)
`;

export async function getParticipants(filters: ParticipantFilters): Promise<ParticipantPage> {
  const client = await createServerSupabaseClient();
  const from = (filters.page - 1) * PARTICIPANT_PAGE_SIZE;
  let query = client
    .from("people")
    .select(PARTICIPANT_SELECT, { count: "exact" })
    .is("deleted_at", null)
    .is("registrations.deleted_at", null)
    .order("last_names")
    .order("first_names")
    .range(from, from + PARTICIPANT_PAGE_SIZE - 1);

  const search = filters.query ? escapePostgrestSearch(filters.query) : "";
  if (search) {
    const pattern = `%${search}%`;
    query = query.or([
      `document_number.ilike.${pattern}`,
      `first_names.ilike.${pattern}`,
      `last_names.ilike.${pattern}`,
      `email.ilike.${pattern}`,
      `phone.ilike.${pattern}`,
    ].join(","));
  }

  const { count, data, error } = await query;
  if (error) throw new Error("No fue posible consultar los participantes.", { cause: error });

  const participants: ParticipantListItem[] = (data ?? []).map((item) => {
    const parsed = participantListItemSchema.safeParse(item);
    if (!parsed.success) throw new Error("La respuesta de participantes no tiene el formato esperado.");
    return parsed.data;
  });
  const total = count ?? 0;
  return {
    page: filters.page,
    pageCount: Math.max(1, Math.ceil(total / PARTICIPANT_PAGE_SIZE)),
    participants,
    total,
  };
}
