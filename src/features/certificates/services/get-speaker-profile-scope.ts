import "server-only";

import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getSpeakerProfileScopeError(activityId: string, speakerId: string): Promise<string | null> {
  if (!z.uuid().safeParse(activityId).success || !z.uuid().safeParse(speakerId).success) return "La actividad o el ponente no son válidos.";
  const client = await createServerSupabaseClient();
  const [activity, assignment, certificate] = await Promise.all([
    client.from("activities").select("status").eq("id", activityId).is("deleted_at", null).maybeSingle(),
    client.from("activity_speakers").select("id").eq("activity_id", activityId).eq("speaker_id", speakerId).is("deleted_at", null).maybeSingle(),
    client.from("certificates").select("id").eq("activity_id", activityId).eq("speaker_id", speakerId).eq("recipient_type", "speaker").is("deleted_at", null).limit(1).maybeSingle(),
  ]);
  if (activity.error || assignment.error || certificate.error) return "No se pudo verificar la relación del ponente con la actividad.";
  if (!activity.data) return "La actividad no está disponible.";
  if (activity.data.status === "archived") return "La actividad está archivada. Esta pantalla es de solo lectura.";
  if (!assignment.data && !certificate.data) return "El ponente ya no pertenece a esta actividad.";
  return null;
}
