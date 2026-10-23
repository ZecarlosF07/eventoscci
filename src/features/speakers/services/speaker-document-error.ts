import "server-only";

import { speakerDocumentConflictSchema } from "@/features/speakers/schemas/speaker-document.schema";
import type { SpeakerDocumentState } from "@/features/speakers/types/speaker-document.types";
import { getSupabaseErrorMessage } from "@/lib/supabase/supabase-error";
import type { SupabaseErrorLike } from "@/lib/supabase/types/supabase-error.types";

export function speakerDocumentError(error: SupabaseErrorLike): SpeakerDocumentState {
  if (error.message?.includes("SPEAKER_DOCUMENT_CONFLICT") && "details" in error && typeof error.details === "string") {
    try {
      const conflict = speakerDocumentConflictSchema.safeParse(JSON.parse(error.details));
      if (conflict.success) return { conflict: conflict.data, message: "El DNI ya pertenece a otro perfil. Revisa ese ponente; no se fusionaron registros." };
    } catch { /* Fall back to an explicit safe error if the service response is malformed. */ }
  }
  return { message: getSupabaseErrorMessage(error, {
    fallback: "No fue posible guardar el DNI. Actualiza la página e inténtalo nuevamente.",
    messages: {
      INVALID_SPEAKER_DNI: "El DNI debe tener exactamente 8 dígitos.",
      SPEAKER_DOCUMENT_ADMIN_REQUIRED: "Solo un administrador puede corregir un DNI con certificados preparados o emitidos.",
      SPEAKER_DOCUMENT_CHANGED: "El DNI cambió mientras editabas. Actualiza la página antes de continuar.",
      SPEAKER_DOCUMENT_CONFIRMATION_REQUIRED: "Escribe el motivo y confirma el cambio de asociación de todo el historial.",
      SPEAKER_DOCUMENT_CONFLICT: "El DNI ya pertenece a otro ponente. Revisa Catálogos antes de continuar.",
      SPEAKER_DOCUMENT_REQUIRED: "El DNI no puede eliminarse porque este ponente tiene certificados preparados o emitidos.",
    },
  }) };
}
