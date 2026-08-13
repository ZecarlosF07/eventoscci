import "server-only";

import { participantDetailSchema } from "@/features/participants/schemas/participant-query.schema";
import type { ParticipantDetail } from "@/features/participants/types/participant.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const PARTICIPANT_DETAIL_SELECT = `
  id, document_type, document_number, first_names, last_names, email, phone,
  job_title, company, ruc, address, created_at,
  registrations(
    id, registration_code, registration_type, status, company_snapshot,
    ruc_snapshot, price_snapshot, created_at,
    activity:activities!inner(id, title, slug, type),
    attendance(status)
  )
`;

export async function getParticipantById(id: string): Promise<ParticipantDetail | null> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client
    .from("people")
    .select(PARTICIPANT_DETAIL_SELECT)
    .eq("id", id)
    .is("deleted_at", null)
    .is("registrations.deleted_at", null)
    .is("registrations.attendance.deleted_at", null)
    .order("created_at", { ascending: false, referencedTable: "registrations" })
    .maybeSingle();

  if (error) throw new Error("No fue posible consultar la ficha del participante.", { cause: error });
  if (!data) return null;
  const parsed = participantDetailSchema.safeParse(data);
  if (!parsed.success) throw new Error("La ficha del participante no tiene el formato esperado.");
  return parsed.data;
}
