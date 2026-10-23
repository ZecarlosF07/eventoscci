"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/constants/routes";
import { requireAdmin } from "@/features/auth/services/admin-session";
import { speakerDocumentSchema } from "@/features/speakers/schemas/speaker-document.schema";
import { speakerDocumentError } from "@/features/speakers/services/speaker-document-error";
import type { SpeakerDocumentState } from "@/features/speakers/types/speaker-document.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function saveSpeakerDocumentAction(formData: FormData): Promise<SpeakerDocumentState> {
  const account = await requireAdmin();
  const parsed = speakerDocumentSchema.safeParse({
    confirmHistory: formData.get("confirm_history") === "on",
    documentNumber: formData.get("document_number"), expectedDocument: formData.get("expected_document"),
    reason: formData.get("reason") ?? "", speakerId: formData.get("speaker_id"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors, message: "Revisa el documento ingresado." };
  const input = parsed.data;
  const client = await createServerSupabaseClient();
  const context = await client.rpc("get_speaker_document_context", { p_speaker_ids: [input.speakerId] });
  if (context.error) return { message: "No fue posible verificar los permisos de identidad." };
  const current = context.data?.[0];
  if (!current) return { message: "El ponente no está disponible." };
  if (current.has_certificates && current.document_number && current.document_number !== input.documentNumber && account.role !== "administrator") {
    return { message: "Solo un administrador puede corregir un DNI con certificados." };
  }
  const { error } = await client.rpc("set_speaker_document", {
    p_confirm_history: input.confirmHistory, p_document_number: input.documentNumber,
    p_expected_document: input.expectedDocument, p_reason: input.reason, p_speaker_id: input.speakerId,
  });
  if (error) return speakerDocumentError(error);
  revalidatePath(`/admin/catalogos/ponentes/${input.speakerId}`);
  revalidatePath("/admin/catalogos/ponentes");
  revalidatePath(`${ROUTES.adminCertificatesSpeakers}/[activityId]`, "page");
  revalidatePath(ROUTES.adminCertificatesSpeakers);
  revalidatePath(ROUTES.campusCertificates);
  return { message: "DNI guardado. El historial finalizado ya puede consultarse con este documento.", success: true };
}
