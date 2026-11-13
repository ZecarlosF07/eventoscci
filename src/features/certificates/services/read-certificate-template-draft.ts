import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getCertificateTemplateByIdWithClient } from "@/features/certificates/queries/get-certificate-templates";
import { certificateSignerFormSchema, certificateTemplateFormSchema } from "@/features/certificates/schemas/certificate.schema";
import { readTemplateAsset } from "@/features/certificates/services/certificate-template-assets";
import { generateCertificatePdf } from "@/features/certificates/services/generate-certificate-pdf";
import { CERTIFICATE_SIGNER_LIMIT } from "@/features/certificates/utils/certificate-design-text";
import type { Database } from "@/lib/supabase/database.types";

export async function readCertificateTemplateDraft(client: SupabaseClient<Database>, form: FormData) {
  const value = (name: string) => String(form.get(name) ?? "");
  const audience = value("audience");
  const model = certificateTemplateFormSchema.safeParse({
    id: value("id"), name: value("name"), audience, heading: value("heading"), recognition: value("recognition"),
    scope: audience === "student" ? "course" : "activity", show_date: form.has("show_date") && audience !== "student",
    is_default: form.has("is_default"), is_active: form.has("is_active"),
  });
  if (!model.success) return { ok: false as const, errors: model.error.flatten().fieldErrors };
  const { id, scope } = model.data;
  const existing = id ? await getCertificateTemplateByIdWithClient(client, id) : null;
  const recipient = model.data.audience === "shared" ? null : model.data.audience;
  if ((id && (!existing || recipient !== (existing.audience ?? null))) || (!id && !recipient)) {
    return { ok: false as const, message: "El tipo de certificado cambió. Vuelve a abrir el modelo." };
  }
  const count = Number(value("signer_count"));
  if (!Number.isInteger(count) || count < 1 || count > CERTIFICATE_SIGNER_LIMIT) {
    return { ok: false as const, message: "Configura entre uno y cuatro firmantes." };
  }
  const errors: Record<string, string[]> = {};
  const load = async (field: string, path: string | null | undefined, staged: boolean) => {
    if (!path) return undefined;
    try {
      return await readTemplateAsset(client, path, staged, field !== "background");
    } catch (error) {
      errors[field] = [error instanceof Error ? error.message : "No se pudo leer la imagen."];
    }
  };
  const stagedBackground = value("background_staged_path");
  const backgroundPath = existing?.background_path ?? null;
  const backgroundBytes = await load("background", stagedBackground || backgroundPath, Boolean(stagedBackground));
  const seen = new Set<string>();
  const signers = [];
  for (let index = 0; index < count; index++) {
    const signerId = value(`signer_id_${index}`);
    const prior = existing?.signers.find(({ id }) => id === signerId);
    const field = `signature_${index}`;
    const staged = value(`${field}_staged_path`);
    const parsed = certificateSignerFormSchema.safeParse({
      existing_signature_path: prior?.signature_path ?? "", sort_order: index,
      signer_name: value(`signer_name_${index}`), signer_title: value(`signer_title_${index}`),
    });
    if (!parsed.success) {
      for (const issue of parsed.error.issues) errors[`${String(issue.path[0])}_${index}`] = [issue.message];
      continue;
    }
    if (signerId && (!prior || seen.has(signerId))) {
      errors[field] = ["El firmante cambió. Vuelve a abrir el modelo."];
      continue;
    }
    if (signerId) seen.add(signerId);
    if (!prior && !staged) errors[field] = ["Sube la imagen de la firma."];
    const signaturePath = prior?.signature_path ?? null;
    signers.push({
      id: prior?.id,
      signer_name: parsed.data.signer_name, signer_title: parsed.data.signer_title || null, sort_order: index,
      signature_path: signaturePath, signatureBytes: await load(field, staged || signaturePath, Boolean(staged)),
      staged: Boolean(staged),
    });
  }
  if (Object.keys(errors).length) return { ok: false as const, errors };
  return {
    ok: true as const, model: model.data, recipient: recipient ?? null, scope, signers,
    templateId: id || crypto.randomUUID(), revision: id ? value("expected_updated_at") : null,
    backgroundPath, backgroundBytes, stagedBackground: Boolean(stagedBackground),
  };
}

export async function renderCertificateDraft(draft: Extract<Awaited<ReturnType<typeof readCertificateTemplateDraft>>, { ok: true }>, sharedSpeaker = false) {
  const recipient = draft.recipient ?? (sharedSpeaker ? "speaker" : "participant");
  return generateCertificatePdf({
    academicHours: recipient === "speaker" ? null : 8,
    accessUrl: "https://example.invalid/muestra",
    backgroundBytes: draft.backgroundBytes,
    certificateCode: "CCI-MUESTRA",
    certificateType: draft.scope,
    condition: recipient === "speaker" ? "Ponente" : recipient === "student" ? "Aprobó" : "Participó",
    dateText: draft.model.show_date ? "15 de noviembre de 2026" : null,
    heading: draft.model.heading, recognition: draft.model.recognition, layoutVersion: 2,
    participantName: "María Fernanda García Torres", preview: true, recipientType: recipient,
    signers: draft.signers,
    title: recipient === "student" ? "Gestión empresarial y herramientas digitales" : "Encuentro de innovación y desarrollo empresarial",
  });
}
