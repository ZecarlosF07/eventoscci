"use server";

import { requireAdmin } from "@/features/auth/services/admin-session";
import { getAdminCatalogRecord } from "@/features/catalogs/queries/get-admin-catalog";
import { getSpeakerProfileScopeError } from "@/features/certificates/services/get-speaker-profile-scope";
import type { SpeakerProfileLoadResult } from "@/features/certificates/types/speaker-profile.types";
import { logSupabaseError } from "@/lib/supabase/supabase-error";

export async function getSpeakerProfileForCertificatesAction(activityId: string, speakerId: string): Promise<SpeakerProfileLoadResult> {
  await requireAdmin();
  const scopeError = await getSpeakerProfileScopeError(activityId, speakerId);
  if (scopeError) return { message: scopeError };
  try {
    const record = await getAdminCatalogRecord("speakers", speakerId);
    if (!record || !("documentContext" in record)) return { message: "El perfil del ponente no está disponible." };
    return { record };
  } catch (error) {
    logSupabaseError("speaker_profile_load_failed", error instanceof Error ? error : { message: "Unknown" }, { speakerId });
    return { message: "No se pudo cargar el perfil. Inténtalo nuevamente." };
  }
}
