import "server-only";

import { myCertificateSchema } from "@/features/certificates/schemas/certificate-query.schema";
import type { MyCertificate } from "@/features/certificates/types/certificate.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function mapMyCertificate(row: typeof myCertificateSchema._output): MyCertificate {
  return {
    accessToken: row.access_token,
    academicHours: row.academic_hours,
    certificateCode: row.certificate_code,
    certificateType: row.certificate_type,
    condition: row.condition,
    courseId: row.course_id,
    fileReady: row.file_ready,
    id: row.id,
    issuedAt: row.issued_at,
    revocationReason: row.revocation_reason,
    status: row.status,
    title: row.title,
  };
}

export async function getMyCertificates(): Promise<MyCertificate[]> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("get_my_certificates");
  if (error) throw new Error("No fue posible cargar tus certificados.", { cause: error });
  const parsed = myCertificateSchema.array().safeParse(data);
  if (!parsed.success) throw new Error("Supabase devolvió certificados inválidos.");
  return parsed.data.map(mapMyCertificate);
}

export async function getMyCourseCertificate(courseId: string): Promise<MyCertificate | null> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("get_my_course_certificate", { p_course_id: courseId });
  if (error) throw new Error("No fue posible cargar el certificado del curso.", { cause: error });
  if (!data) return null;
  const parsed = myCertificateSchema.safeParse(data);
  if (!parsed.success) throw new Error("Supabase devolvió un certificado inválido.");
  return mapMyCertificate(parsed.data);
}
