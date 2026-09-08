import "server-only";

import { CERTIFICATE_CANDIDATE_PAGE_SIZE } from "@/features/certificates/constants/certificate.constants";
import { certificateCandidateRegistrationSchema } from "@/features/certificates/schemas/certificate-query.schema";
import type {
  CertificateCandidate,
  CertificateCandidateFilters,
  CertificateCandidatePage,
} from "@/features/certificates/types/certificate.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function matchesQuery(candidate: CertificateCandidate, query?: string): boolean {
  if (!query) return true;
  const normalized = query.toLocaleLowerCase("es-PE");
  return [
    candidate.registration_code,
    candidate.person.document_number,
    candidate.person.email,
    candidate.person.first_names,
    candidate.person.last_names,
    `${candidate.person.first_names} ${candidate.person.last_names}`,
  ].some((value) => value.toLocaleLowerCase("es-PE").includes(normalized));
}

export async function getLegacyActivityCertificateCandidates(
  activityId: string,
  filters: CertificateCandidateFilters,
): Promise<CertificateCandidatePage> {
  const client = await createServerSupabaseClient();
  const registrationResult = await client.from("registrations")
    .select("id, registration_code, status, company_snapshot, person:people!inner(id, document_number, first_names, last_names, email), attendance(status)")
    .eq("activity_id", activityId).is("deleted_at", null).is("person.deleted_at", null).is("attendance.deleted_at", null)
    .order("created_at", { ascending: false });
  if (registrationResult.error) {
    throw new Error("No fue posible consultar los candidatos a certificado.", { cause: registrationResult.error });
  }

  const registrations = (registrationResult.data ?? []).flatMap((item) => {
    const parsed = certificateCandidateRegistrationSchema.safeParse(item);
    if (!parsed.success || !parsed.data.attendance[0]) return [];
    return [{
      ...parsed.data,
      attendance: parsed.data.attendance[0],
      certificate: null,
    } satisfies CertificateCandidate];
  }).filter((candidate) => matchesQuery(candidate, filters.query));
  const total = registrations.length;
  const offset = (filters.page - 1) * CERTIFICATE_CANDIDATE_PAGE_SIZE;
  const candidates = registrations.slice(offset, offset + CERTIFICATE_CANDIDATE_PAGE_SIZE);
  const registrationIds = candidates.map((candidate) => candidate.id);

  const certificateResult = registrationIds.length
    ? await client.from("certificates")
      .select("id, registration_id, certificate_code, status, file_path")
      .eq("certificate_type", "activity").in("registration_id", registrationIds).is("deleted_at", null)
    : { data: [], error: null };
  if (certificateResult.error) {
    throw new Error("No fue posible consultar los certificados emitidos.", { cause: certificateResult.error });
  }

  const certificates = new Map((certificateResult.data ?? []).map((item) => [item.registration_id, item]));
  return {
    candidates: candidates.map((candidate) => ({ ...candidate, certificate: certificates.get(candidate.id) ?? null })),
    page: filters.page,
    pageCount: Math.max(1, Math.ceil(total / CERTIFICATE_CANDIDATE_PAGE_SIZE)),
    total,
  };
}
