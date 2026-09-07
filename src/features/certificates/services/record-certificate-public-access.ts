import "server-only";

import type { CertificatePublicAccessInput } from "@/features/certificates/types/certificate-access.types";
import type { TypedSupabaseClient } from "@/lib/supabase/types/supabase-client.types";

const VIEW_DEDUPLICATION_MINUTES = 30;

export async function recordCertificatePublicAccess(
  client: TypedSupabaseClient,
  input: CertificatePublicAccessInput,
): Promise<"duplicate" | "not_found" | "recorded"> {
  const certificateResult = await client.from("certificates")
    .select("id")
    .eq("access_token", input.token)
    .is("deleted_at", null)
    .maybeSingle();

  if (certificateResult.error) throw new Error("No fue posible resolver el certificado.", { cause: certificateResult.error });
  if (!certificateResult.data) return "not_found";

  if (input.action === "certificate.public_view") {
    const since = new Date(Date.now() - VIEW_DEDUPLICATION_MINUTES * 60_000).toISOString();
    let recentQuery = client.from("audit_logs")
      .select("id")
      .eq("action", input.action)
      .eq("entity_type", "certificate")
      .eq("entity_id", certificateResult.data.id)
      .gte("created_at", since)
      .limit(1);
    if (input.ipAddress) recentQuery = recentQuery.eq("ip_address", input.ipAddress);
    else if (input.userAgent) recentQuery = recentQuery.is("ip_address", null).eq("user_agent", input.userAgent);
    else recentQuery = recentQuery.is("ip_address", null).is("user_agent", null);
    const recentResult = await recentQuery.maybeSingle();
    if (recentResult.error) throw new Error("No fue posible verificar la visita reciente.", { cause: recentResult.error });
    if (recentResult.data) return "duplicate";
  }

  const insertResult = await client.from("audit_logs").insert({
    action: input.action,
    entity_id: certificateResult.data.id,
    entity_type: "certificate",
    ip_address: input.ipAddress,
    new_data: { source: input.source },
    user_agent: input.userAgent,
  });
  if (insertResult.error) throw new Error("No fue posible registrar el acceso al certificado.", { cause: insertResult.error });
  return "recorded";
}
