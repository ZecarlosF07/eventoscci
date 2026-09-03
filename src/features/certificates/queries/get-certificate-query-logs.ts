import "server-only";

import { CERTIFICATE_QUERY_LOG_PAGE_SIZE } from "@/features/certificates/constants/certificate.constants";
import { certificateQueryAuditRowSchema } from "@/features/certificates/schemas/certificate-query-log.schema";
import type { CertificateQueryLogFilters, CertificateQueryLogItem, CertificateQueryLogPage } from "@/features/certificates/types/certificate.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function ipText(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export async function getCertificateQueryLogs(filters: CertificateQueryLogFilters): Promise<CertificateQueryLogPage> {
  const client = await createServerSupabaseClient();
  const from = (filters.page - 1) * CERTIFICATE_QUERY_LOG_PAGE_SIZE;
  let query = client.from("audit_logs")
    .select("id, actor_user_id, new_data, ip_address, user_agent, created_at", { count: "exact" })
    .in("action", ["certificate.public_search", "certificate.public_search.rate_limited"])
    .order("created_at", { ascending: false });

  if (filters.documentNumber) query = query.filter("new_data->>document_number", "eq", filters.documentNumber);
  if (filters.outcome) query = query.filter("new_data->>outcome", "eq", filters.outcome);
  if (filters.dateFrom) query = query.gte("created_at", `${filters.dateFrom}T00:00:00-05:00`);
  if (filters.dateTo) query = query.lte("created_at", `${filters.dateTo}T23:59:59.999-05:00`);

  const { count, data, error } = await query.range(from, from + CERTIFICATE_QUERY_LOG_PAGE_SIZE - 1);
  if (error) throw new Error("No fue posible consultar la bitácora pública.", { cause: error });
  const rows = (data ?? []).map((row) => {
    const parsed = certificateQueryAuditRowSchema.safeParse(row);
    if (!parsed.success) throw new Error("La bitácora contiene un registro con formato inesperado.");
    return parsed.data;
  });
  const actorIds = [...new Set(rows.flatMap((row) => row.actor_user_id ? [row.actor_user_id] : []))];
  const actors = actorIds.length ? await client.from("user_accounts")
    .select("user_id, person:people!inner(first_names, last_names)")
    .in("user_id", actorIds) : { data: [], error: null };
  if (actors.error) throw new Error("No fue posible resolver los usuarios de la bitácora.", { cause: actors.error });
  const actorLabels = new Map((actors.data ?? []).map((actor) => [actor.user_id, `${actor.person.first_names} ${actor.person.last_names}`]));
  const items: CertificateQueryLogItem[] = rows.map((row) => ({
    actorLabel: row.actor_user_id ? actorLabels.get(row.actor_user_id) ?? "Usuario autenticado" : null,
    createdAt: row.created_at,
    documentNumber: row.new_data.document_number,
    id: row.id,
    ipAddress: ipText(row.ip_address),
    outcome: row.new_data.outcome,
    resultCount: row.new_data.result_count,
    userAgent: row.user_agent,
  }));
  const total = count ?? 0;
  return { items, page: filters.page, pageCount: Math.max(1, Math.ceil(total / CERTIFICATE_QUERY_LOG_PAGE_SIZE)), total };
}
