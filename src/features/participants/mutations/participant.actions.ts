"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/constants/routes";
import { requireAdmin } from "@/features/auth/services/admin-session";
import { participantFormSchema } from "@/features/participants/schemas/participant.schema";
import type { ParticipantFormState } from "@/features/participants/types/participant.types";
import type { Json } from "@/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/supabase-error";

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
  if (error) {
    logSupabaseError("participant_update_failed", error, { participantId });
    return {
      message: getSupabaseErrorMessage(error, {
        fallback: "No se pudo actualizar al participante. Actualiza la página e inténtalo nuevamente.",
        messages: {
          PARTICIPANT_NOT_FOUND: "El participante ya no está disponible. Regresa al listado y vuelve a abrir su ficha.",
          VALIDATION_ERROR: "Los datos del participante no cumplen las reglas institucionales. Revisa los campos indicados.",
        },
      }),
    };
  }

  revalidatePath(ROUTES.adminParticipants);
  revalidatePath(`${ROUTES.adminParticipants}/${participantId}`);
  return { message: "Datos del participante actualizados.", success: true };
}
