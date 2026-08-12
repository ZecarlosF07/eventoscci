import type { SpeakerSummary } from "@/features/speakers/types/speaker.types";
import type { TypedSupabaseClient } from "@/lib/supabase/types/supabase-client.types";

export async function getActiveSpeakers(
  client: TypedSupabaseClient,
): Promise<SpeakerSummary[]> {
  const { data, error } = await client
    .from("speakers")
    .select(
      "id, first_names, last_names, professional_title, organization",
    )
    .is("deleted_at", null)
    .order("last_names", { ascending: true })
    .order("first_names", { ascending: true });

  if (error) {
    throw new Error("No fue posible consultar los expositores.", {
      cause: error,
    });
  }

  return data;
}
