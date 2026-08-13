"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/constants/routes";
import { requireAdmin } from "@/features/auth/services/admin-session";
import { participantFormSchema } from "@/features/participants/schemas/participant.schema";
import type { ParticipantFormState } from "@/features/participants/types/participant.types";
import type { Json } from "@/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function updateParticipantAction(
  participantId: string,
  _previousState: ParticipantFormState,
  formData: FormData,
): Promise<ParticipantFormState> {
  await requireAdmin();
  const parsed = participantFormSchema.safeParse({
    address: formData.get("address"),
    company: formData.get("company"),
    email: formData.get("email"),
    first_names: formData.get("first_names"),
    job_title: formData.get("job_title"),
    last_names: formData.get("last_names"),
    phone: formData.get("phone"),
    ruc: formData.get("ruc"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const client = await createServerSupabaseClient();
  const { error } = await client.rpc("update_participant", {
    p_person: parsed.data as Json,
    p_person_id: participantId,
  });
  if (error) return { message: "No fue posible actualizar al participante." };

  revalidatePath(ROUTES.adminParticipants);
  revalidatePath(`${ROUTES.adminParticipants}/${participantId}`);
  return { message: "Datos del participante actualizados.", success: true };
}
