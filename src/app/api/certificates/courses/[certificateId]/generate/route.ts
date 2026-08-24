import { issueCourseCertificate } from "@/features/certificates/services/issue-course-certificate";
import type { CourseCertificateGenerationRouteContext } from "@/features/certificates/types/certificate.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { z } from "zod";

export async function POST(
  _request: Request,
  context: CourseCertificateGenerationRouteContext,
): Promise<Response> {
  const { certificateId } = await context.params;
  const parsedCertificateId = z.uuid().safeParse(certificateId);
  if (!parsedCertificateId.success) {
    return Response.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("authorize_course_certificate_generation", {
    p_certificate_id: parsedCertificateId.data,
  });
  if (error || !data) return Response.json({ error: "No autorizado." }, { status: 403 });
  try {
    await issueCourseCertificate(parsedCertificateId.data);
    return Response.json({ ready: true });
  } catch {
    return Response.json({ error: "No fue posible generar el certificado." }, { status: 503 });
  }
}
