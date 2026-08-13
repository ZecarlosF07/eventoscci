import "server-only";

import { certificateCandidateRegistrationSchema } from "@/features/certificates/schemas/certificate-query.schema";
import { getCertificateTemplates } from "@/features/certificates/queries/get-certificate-templates";
import type { ActivityCertificateData, CertificateCandidate } from "@/features/certificates/types/certificate.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getActivityCertificateData(activityId: string): Promise<ActivityCertificateData | null> {
  const client = await createServerSupabaseClient();
  const [activityResult, registrationResult, templates] = await Promise.all([
    client.from("activities").select("id, title, type").eq("id", activityId).is("deleted_at", null).maybeSingle(),
    client.from("registrations")
      .select("id, registration_code, status, company_snapshot, person:people!inner(document_number, first_names, last_names, email), attendance(status)")
      .eq("activity_id", activityId).is("deleted_at", null).is("person.deleted_at", null).is("attendance.deleted_at", null)
      .order("created_at", { ascending: false }),
    getCertificateTemplates(true),
  ]);
  const error = activityResult.error ?? registrationResult.error;
  if (error) throw new Error("No fue posible consultar los candidatos a certificado.", { cause: error });
  if (!activityResult.data) return null;

  const registrationIds = (registrationResult.data ?? []).map((item) => item.id);
  const certificateResult = registrationIds.length
    ? await client.from("certificates")
      .select("id, registration_id, certificate_code, status, file_path")
      .eq("certificate_type", "activity").in("registration_id", registrationIds).is("deleted_at", null)
    : { data: [], error: null };
  if (certificateResult.error) {
    throw new Error("No fue posible consultar los certificados emitidos.", { cause: certificateResult.error });
  }

  const certificates = new Map((certificateResult.data ?? []).map((item) => [item.registration_id, item]));
  const candidates: CertificateCandidate[] = (registrationResult.data ?? []).map((item) => {
    const parsed = certificateCandidateRegistrationSchema.safeParse(item);
    if (!parsed.success || !parsed.data.attendance[0]) throw new Error("La respuesta de elegibilidad no tiene el formato esperado.");
    const certificate = certificates.get(parsed.data.id);
    return {
      ...parsed.data,
      attendance: parsed.data.attendance[0],
      certificate: certificate ? {
        certificate_code: certificate.certificate_code,
        file_path: certificate.file_path,
        id: certificate.id,
        status: certificate.status,
      } : null,
    };
  });
  return { activity: activityResult.data, candidates, templates: templates.filter((template) => template.scope === "activity") };
}
