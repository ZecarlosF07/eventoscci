import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { certificateGenerationSchema, certificateTemplateSchema } from "@/features/certificates/schemas/certificate-query.schema";
import { getCertificateTemplateByIdWithClient } from "@/features/certificates/queries/get-certificate-templates";
import type { CertificateGenerationData } from "@/features/certificates/types/certificate.types";
import type { Database } from "@/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getCertificateGenerationDataWithClient(
  client: SupabaseClient<Database>,
  id: string,
): Promise<CertificateGenerationData | null> {
  const { data, error } = await client.from("certificates")
    .select(`
      id, access_token, academic_hours_snapshot, certificate_code, certificate_type, recipient_type,
      condition_snapshot, date_text_snapshot, file_path, participant_name_snapshot,
      status, template_id, title_snapshot, activity_id, template_snapshot,
      registration:registrations!certificates_registration_id_fkey(
        activity:activities!inner(status)
      ),
      speaker_activity:activities!certificates_activity_id_fkey(status)
    `)
    .eq("id", id).is("deleted_at", null).maybeSingle();
  if (error) throw new Error("No fue posible preparar el documento del certificado.", { cause: error });
  if (!data) return null;
  const activityStatus = data.recipient_type === "speaker"
    ? data.speaker_activity?.status
    : data.registration?.activity.status;
  if (data.certificate_type === "activity" && activityStatus === "archived") return null;
  const [parsed, template] = [
    certificateGenerationSchema.safeParse(data),
    data.recipient_type === "speaker" && data.template_snapshot
      ? certificateTemplateSchema.parse(data.template_snapshot)
      : await getCertificateTemplateByIdWithClient(client, data.template_id),
  ];
  if (!parsed.success || !template) throw new Error("La información del certificado no tiene el formato esperado.");
  return { ...parsed.data, template };
}

export async function getCertificateGenerationData(id: string): Promise<CertificateGenerationData | null> {
  return getCertificateGenerationDataWithClient(await createServerSupabaseClient(), id);
}
