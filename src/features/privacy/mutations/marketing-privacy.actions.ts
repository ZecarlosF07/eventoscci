"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ROUTES } from "@/constants/routes";
import { requireAdmin } from "@/features/auth/services/admin-session";
import type { PrivacyFormState } from "@/features/privacy/types/privacy.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function withdrawMarketingConsent(personId: string, _state: PrivacyFormState, formData: FormData): Promise<PrivacyFormState> {
  await requireAdmin();
  const parsed = z.object({ id: z.uuid(), reason: z.string().trim().min(2, "Indica el motivo de la baja.").max(500) }).safeParse({ id: personId, reason: formData.get("reason") });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const client = await createServerSupabaseClient();
  const { error } = await client.rpc("withdraw_marketing_consent", { p_person_id: personId, p_reason: parsed.data.reason });
  if (error) return { message: "No fue posible registrar la baja. Inténtalo nuevamente." };
  revalidatePath(`${ROUTES.adminParticipants}/${personId}`);
  return { success: true, message: "Baja registrada para correo y WhatsApp. No afecta sus inscripciones ni certificados." };
}
