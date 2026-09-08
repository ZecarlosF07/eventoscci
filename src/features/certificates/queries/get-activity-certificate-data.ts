import "server-only";

import { CERTIFICATE_CANDIDATE_PAGE_SIZE } from "@/features/certificates/constants/certificate.constants";
import { getCertificateTemplates } from "@/features/certificates/queries/get-certificate-templates";
import type {
  ActivityCertificateData,
  CertificateCandidate,
  CertificateCandidateFilters,
} from "@/features/certificates/types/certificate.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getActivityCertificateData(
  activityId: string,
  filters: CertificateCandidateFilters,
): Promise<ActivityCertificateData | null> {
  const client = await createServerSupabaseClient();
  const [activityResult, candidateResult, templates] = await Promise.all([
    client.from("activities").select("id, title, type").eq("id", activityId).is("deleted_at", null).maybeSingle(),
    client.rpc("get_activity_certificate_candidates", {
      p_activity_id: activityId,
      p_limit: CERTIFICATE_CANDIDATE_PAGE_SIZE,
      p_offset: (filters.page - 1) * CERTIFICATE_CANDIDATE_PAGE_SIZE,
      p_query: filters.query,
    }),
    getCertificateTemplates(true),
  ]);
  const error = activityResult.error ?? candidateResult.error;
  if (error) throw new Error("No fue posible consultar los candidatos a certificado.", { cause: error });
  if (!activityResult.data) return null;

  const candidates: CertificateCandidate[] = (candidateResult.data ?? []).map((item) => {
    return {
      attendance: { status: item.attendance_status },
      certificate: item.certificate_id && item.certificate_code && item.certificate_status ? {
        certificate_code: item.certificate_code,
        file_path: item.file_path,
        id: item.certificate_id,
        status: item.certificate_status,
      } : null,
      company_snapshot: item.company_snapshot,
      id: item.registration_id,
      person: {
        document_number: item.document_number,
        email: item.email,
        first_names: item.first_names,
        id: item.person_id,
        last_names: item.last_names,
      },
      registration_code: item.registration_code,
      status: item.registration_status,
    };
  });
  const total = Number(candidateResult.data?.[0]?.total_count ?? 0);
  return {
    activity: activityResult.data,
    candidatePage: {
      candidates,
      page: filters.page,
      pageCount: Math.max(1, Math.ceil(total / CERTIFICATE_CANDIDATE_PAGE_SIZE)),
      total,
    },
    templates: templates.filter((template) => template.scope === "activity"),
  };
}
