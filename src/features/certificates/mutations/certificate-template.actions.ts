"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/constants/routes";
import { requireAdmin } from "@/features/auth/services/admin-session";
import { certificateTemplateFormSchema } from "@/features/certificates/schemas/certificate.schema";
import { uploadTemplateAsset } from "@/features/certificates/services/certificate-template-assets";
import type { CertificateSigner, CertificateTemplateFormState } from "@/features/certificates/types/certificate.types";
import { checkboxValue, signerFromFormData } from "@/features/certificates/utils/certificate-form-data";
import type { Json } from "@/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const MAX_SIGNERS = 3;

export async function saveCertificateTemplateAction(
  _previousState: CertificateTemplateFormState,
  formData: FormData,
): Promise<CertificateTemplateFormState> {
  await requireAdmin();
  const parsed = certificateTemplateFormSchema.safeParse({
    id: formData.get("id") ?? "",
    is_active: checkboxValue(formData, "is_active"),
    is_default: checkboxValue(formData, "is_default"),
    name: formData.get("name"),
    scope: formData.get("scope"),
    show_date: checkboxValue(formData, "show_date"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const signers = Array.from({ length: MAX_SIGNERS }, (_, index) => signerFromFormData(formData, index)).filter((item): item is Omit<CertificateSigner, "id"> => Boolean(item));
  if (!signers.length) return { message: "Configura al menos un firmante." };

  const client = await createServerSupabaseClient();
  const templateId = parsed.data.id || crypto.randomUUID();
  const background = formData.get("background");
  let backgroundPath = typeof formData.get("existing_background_path") === "string" ? String(formData.get("existing_background_path")) : "";
  try {
    if (background instanceof File && background.size) backgroundPath = await uploadTemplateAsset(templateId, "background", background);
    for (let index = 0; index < signers.length; index += 1) {
      const signature = formData.get(`signature_${signers[index].sort_order}`);
      if (signature instanceof File && signature.size) signers[index].signature_path = await uploadTemplateAsset(templateId, "signature", signature);
    }
  } catch (error) {
    return { message: error instanceof Error ? error.message : "No fue posible cargar las imágenes." };
  }

  const { error } = await client.rpc("save_certificate_template", {
    p_signers: signers as Json,
    p_template: {
      background_path: backgroundPath || null,
      id: templateId,
      is_active: parsed.data.is_active,
      is_default: parsed.data.is_default,
      name: parsed.data.name,
      scope: parsed.data.scope,
      template_config: { show_date: parsed.data.show_date },
    },
  });
  if (error) return { message: "No fue posible guardar la plantilla." };
  revalidatePath(ROUTES.adminCertificateTemplates);
  return { message: "Plantilla guardada correctamente.", success: true };
}

export async function deleteCertificateTemplateAction(templateId: string): Promise<void> {
  await requireAdmin();
  const client = await createServerSupabaseClient();
  const { error } = await client.rpc("soft_delete_certificate_template", { p_template_id: templateId });
  if (error) throw new Error("No se puede retirar una plantilla en uso.", { cause: error });
  revalidatePath(ROUTES.adminCertificateTemplates);
}
