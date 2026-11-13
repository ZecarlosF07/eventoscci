"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ROUTES } from "@/constants/routes";
import { requireAdmin } from "@/features/auth/services/admin-session";
import { storeTemplateAsset } from "@/features/certificates/services/certificate-template-assets";
import { readCertificateTemplateDraft, renderCertificateDraft } from "@/features/certificates/services/read-certificate-template-draft";
import type { CertificateTemplateFormState } from "@/features/certificates/types/certificate.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/supabase-error";

const templateErrors = {
  LAST_ACTIVE_COURSE_TEMPLATE: "Activa otro modelo de Cursos antes de desactivar o retirar este. El Campus necesita uno para emitir.",
  TEMPLATE_BATCH_ACTIVE: "Termina la tanda de emisión activa antes de modificar o retirar este modelo.",
  TEMPLATE_CHANGED: "El modelo cambió. Actualiza la página antes de volver a guardar.",
  TEMPLATE_NOT_FOUND: "El modelo ya no está disponible.",
  SIGNATURE_REQUIRED: "Sube una imagen para cada firmante nuevo.",
  VALIDATION_ERROR: "Revisa el nombre, el tipo y los firmantes del modelo.",
};

export async function saveCertificateTemplateAction(formData: FormData): Promise<CertificateTemplateFormState> {
  if ((await requireAdmin()).role !== "administrator") return { message: "Solo un administrador puede guardar modelos." };
  const client = await createServerSupabaseClient();
  try {
    const draft = await readCertificateTemplateDraft(client, formData);
    if (!draft.ok) return { errors: draft.errors, message: draft.message ?? "Revisa los campos indicados." };
    await renderCertificateDraft(draft);
    if (!draft.recipient) await renderCertificateDraft(draft, true);
    const { templateId, model } = draft;
    const signers = [];
    for (const signer of draft.signers) {
      const { staged, signatureBytes, ...values } = signer;
      if (staged && signatureBytes) values.signature_path = await storeTemplateAsset(client, templateId, "signature", signatureBytes);
      signers.push(values);
    }
    const backgroundPath = draft.stagedBackground && draft.backgroundBytes
      ? await storeTemplateAsset(client, templateId, "background", draft.backgroundBytes)
      : draft.backgroundPath;
    const { error } = await client.rpc("save_certificate_template", {
      p_signers: signers,
      p_template: {
        id: templateId, audience: draft.recipient, scope: draft.scope, name: model.name,
        background_path: backgroundPath, is_active: model.is_active, is_default: model.is_default,
        expected_updated_at: draft.revision,
        template_config: { heading: model.heading, recognition: model.recognition, show_date: model.show_date },
      },
    });
    if (error) {
      logSupabaseError("certificate_template_save_failed", error, { templateId });
      return { message: getSupabaseErrorMessage(error, { fallback: "No se pudo guardar el modelo.", messages: templateErrors }) };
    }
    revalidatePath(ROUTES.adminCertificateTemplates);
    return { message: "Modelo guardado.", success: true, templateId };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "No se pudo guardar el modelo." };
  }
}

export async function deleteCertificateTemplateAction(templateId: string): Promise<CertificateTemplateFormState> {
  if ((await requireAdmin()).role !== "administrator") return { message: "Solo un administrador puede retirar modelos." };
  if (!z.uuid().safeParse(templateId).success) return { message: "Modelo inválido." };
  const client = await createServerSupabaseClient();
  const { error } = await client.rpc("retire_certificate_template", { p_template_id: templateId });
  if (error) return { message: getSupabaseErrorMessage(error, {
    fallback: "No se pudo retirar el modelo. Inténtalo nuevamente.",
    messages: templateErrors,
  }) };
  revalidatePath(ROUTES.adminCertificateTemplates);
  return { success: true, message: "Modelo retirado." };
}
