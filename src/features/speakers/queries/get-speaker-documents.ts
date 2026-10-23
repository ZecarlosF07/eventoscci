import "server-only";

import { speakerDocumentContextSchema } from "@/features/speakers/schemas/speaker-document.schema";
import type { SpeakerDocumentContext } from "@/features/speakers/types/speaker-document.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getSpeakerDocuments(speakerIds: string[]): Promise<Map<string, SpeakerDocumentContext>> {
  if (!speakerIds.length) return new Map();
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("get_speaker_document_context", { p_speaker_ids: speakerIds });
  if (error) throw new Error("No fue posible consultar la identidad de los ponentes.", { cause: error });
  const rows = speakerDocumentContextSchema.array().parse(data);
  return new Map(rows.map((row) => [row.speaker_id, {
    canCorrect: row.can_correct, documentNumber: row.document_number, hasCertificates: row.has_certificates,
  }]));
}
