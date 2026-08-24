import "server-only";

import { CERTIFICATE_PAGE_SIZE } from "@/features/certificates/constants/certificate.constants";
import { certificateAdminItemSchema } from "@/features/certificates/schemas/certificate-query.schema";
import type { CertificateAdminItem, CertificateAdminPage } from "@/features/certificates/types/certificate.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getCertificates(page: number): Promise<CertificateAdminPage> {
  const client = await createServerSupabaseClient();
  const from = (page - 1) * CERTIFICATE_PAGE_SIZE;
  const { count, data, error } = await client.from("certificates")
    .select("id, certificate_code, certificate_type, status, participant_name_snapshot, title_snapshot, condition_snapshot, file_path, issued_at, revocation_reason, registration:registrations(activity_id)", { count: "exact" })
    .is("deleted_at", null)
    .order("issued_at", { ascending: false }).range(from, from + CERTIFICATE_PAGE_SIZE - 1);
  if (error) throw new Error("No fue posible consultar los certificados.", { cause: error });
  const certificates: CertificateAdminItem[] = (data ?? []).map((item) => {
    const parsed = certificateAdminItemSchema.safeParse(item);
    if (!parsed.success) throw new Error("La respuesta de certificados no tiene el formato esperado.");
    return parsed.data;
  });
  const total = count ?? 0;
  return { certificates, page, pageCount: Math.max(1, Math.ceil(total / CERTIFICATE_PAGE_SIZE)), total };
}
