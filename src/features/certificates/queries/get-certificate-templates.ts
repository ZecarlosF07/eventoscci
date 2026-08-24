import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { certificateSignerSchema, certificateTemplateSchema } from "@/features/certificates/schemas/certificate-query.schema";
import type { CertificateSigner, CertificateTemplate } from "@/features/certificates/types/certificate.types";
import type { Database } from "@/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getCertificateTemplatesWithClient(
  client: SupabaseClient<Database>,
  activeOnly = false,
): Promise<CertificateTemplate[]> {
  let templateQuery = client
    .from("certificate_templates")
    .select("id, name, scope, background_path, template_config, is_default, is_active, updated_at")
    .is("deleted_at", null)
    .order("is_default", { ascending: false })
    .order("name");
  if (activeOnly) templateQuery = templateQuery.eq("is_active", true);

  const [templateResult, signerResult] = await Promise.all([
    templateQuery,
    client.from("certificate_template_signers")
      .select("id, template_id, signer_name, signer_title, signature_path, sort_order")
      .is("deleted_at", null)
      .order("sort_order"),
  ]);
  if (templateResult.error || signerResult.error) {
    throw new Error("No fue posible consultar las plantillas de certificados.", { cause: templateResult.error ?? signerResult.error });
  }

  const signersByTemplate = new Map<string, CertificateSigner[]>();
  (signerResult.data ?? []).forEach((item) => {
    const parsed = certificateSignerSchema.safeParse(item);
    if (!parsed.success) throw new Error("La respuesta de firmantes no tiene el formato esperado.");
    signersByTemplate.set(item.template_id, [...(signersByTemplate.get(item.template_id) ?? []), parsed.data]);
  });

  return (templateResult.data ?? []).map((template) => {
    const parsed = certificateTemplateSchema.safeParse({ ...template, signers: signersByTemplate.get(template.id) ?? [] });
    if (!parsed.success) throw new Error("La respuesta de plantillas no tiene el formato esperado.");
    return parsed.data;
  });
}

export async function getCertificateTemplates(activeOnly = false): Promise<CertificateTemplate[]> {
  return getCertificateTemplatesWithClient(await createServerSupabaseClient(), activeOnly);
}

export async function getCertificateTemplateById(id: string): Promise<CertificateTemplate | null> {
  const templates = await getCertificateTemplates();
  return templates.find((template) => template.id === id) ?? null;
}

export async function getCertificateTemplateByIdWithClient(
  client: SupabaseClient<Database>,
  id: string,
): Promise<CertificateTemplate | null> {
  const templates = await getCertificateTemplatesWithClient(client);
  return templates.find((template) => template.id === id) ?? null;
}
