import "server-only";

import { CERTIFICATE_BACKGROUND_TYPES, CERTIFICATE_BUCKET, CERTIFICATE_SIGNATURE_TYPES, MAX_CERTIFICATE_ASSET_SIZE } from "@/features/certificates/constants/certificate.constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/supabase-error";

function validateFile(file: File, types: string[]): void {
  if (!types.includes(file.type)) throw new Error("Usa una imagen PNG, JPG o WebP.");
  if (file.size > MAX_CERTIFICATE_ASSET_SIZE) throw new Error("La imagen no debe superar 5 MB.");
}

export async function uploadTemplateAsset(
  templateId: string,
  kind: "background" | "signature",
  file: File,
): Promise<string> {
  validateFile(file, kind === "background" ? CERTIFICATE_BACKGROUND_TYPES : CERTIFICATE_SIGNATURE_TYPES);
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const path = `templates/${templateId}/${kind}-${crypto.randomUUID()}.${extension}`;
  const client = await createServerSupabaseClient();
  const { error } = await client.storage.from(CERTIFICATE_BUCKET).upload(path, file, { contentType: file.type });
  if (error) {
    logSupabaseError("certificate_template_asset_upload_failed", error, { assetKind: kind, templateId });
    throw new Error(getSupabaseErrorMessage(error, {
      fallback: "No se pudo cargar la imagen. Revisa tu conexión y vuelve a seleccionarla.",
      messages: {
        "BUCKET NOT FOUND": "El almacenamiento de certificados no está disponible. Comunícate con el administrador.",
        "MIME TYPE": "El formato de la imagen no está permitido. Usa PNG, JPG o WebP.",
      },
    }), { cause: error });
  }
  return path;
}
