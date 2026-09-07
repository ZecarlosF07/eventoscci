import "server-only";

import { CERTIFICATE_ACCESS_LOG_PAGE_SIZE } from "@/features/certificates/constants/certificate.constants";
import { certificateAccessAuditRowSchema, certificateAccessCertificateRowSchema } from "@/features/certificates/schemas/certificate-access.schema";
import type { CertificateAccessLogItem, CertificateAccessLogPage } from "@/features/certificates/types/certificate-access.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function ipText(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export async function getCertificateAccessLogs(page: number): Promise<CertificateAccessLogPage> {
  const client = await createServerSupabaseClient();
  const from = (page - 1) * CERTIFICATE_ACCESS_LOG_PAGE_SIZE;
  const logResult = await client.from("audit_logs")
    .select("id, action, entity_id, new_data, ip_address, user_agent, created_at", { count: "exact" })
    .in("action", ["certificate.public_view", "certificate.public_download"])
    .order("created_at", { ascending: false })
    .range(from, from + CERTIFICATE_ACCESS_LOG_PAGE_SIZE - 1);
  if (logResult.error) throw new Error("No fue posible consultar los accesos públicos.", { cause: logResult.error });

  const logs = (logResult.data ?? []).map((row) => {
    const parsed = certificateAccessAuditRowSchema.safeParse(row);
    if (!parsed.success) throw new Error("La bitácora contiene un acceso con formato inesperado.");
    return parsed.data;
  });
  const certificateIds = [...new Set(logs.map((log) => log.entity_id))];
  const certificateResult = certificateIds.length
    ? await client.from("certificates").select("id, person_id, certificate_code, participant_name_snapshot, title_snapshot").in("id", certificateIds)
    : { data: [], error: null };
  if (certificateResult.error) throw new Error("No fue posible resolver los certificados consultados.", { cause: certificateResult.error });
  const certificates = (certificateResult.data ?? []).map((row) => certificateAccessCertificateRowSchema.parse(row));
  const peopleIds = [...new Set(certificates.map((certificate) => certificate.person_id))];
  const peopleResult = peopleIds.length
    ? await client.from("people").select("id, document_number").in("id", peopleIds)
    : { data: [], error: null };
  if (peopleResult.error) throw new Error("No fue posible resolver los participantes consultados.", { cause: peopleResult.error });

  const certificatesById = new Map(certificates.map((certificate) => [certificate.id, certificate]));
  const documentsByPersonId = new Map((peopleResult.data ?? []).map((person) => [person.id, person.document_number]));
  const items: CertificateAccessLogItem[] = logs.map((log) => {
    const certificate = certificatesById.get(log.entity_id);
    return {
      action: log.action,
      certificateCode: certificate?.certificate_code ?? "No disponible",
      certificateTitle: certificate?.title_snapshot ?? "Certificado no disponible",
      createdAt: log.created_at,
      documentNumber: certificate ? documentsByPersonId.get(certificate.person_id) ?? null : null,
      id: log.id,
      ipAddress: ipText(log.ip_address),
      participantName: certificate?.participant_name_snapshot ?? "Participante no disponible",
      source: log.new_data?.source ?? "direct",
      userAgent: log.user_agent,
    };
  });
  const total = logResult.count ?? 0;
  return { items, page, pageCount: Math.max(1, Math.ceil(total / CERTIFICATE_ACCESS_LOG_PAGE_SIZE)), total };
}
