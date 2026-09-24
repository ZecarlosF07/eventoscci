import { z } from "zod";

import { getAdminSession } from "@/features/auth/services/admin-session";
import { getMemberGroupAdminList } from "@/features/member-groups/queries/get-member-group-admin-list";
import { memberGroupsToCsv, type MemberGroupExportSeat } from "@/features/member-groups/utils/member-group-csv";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request): Promise<Response> {
  if (!await getAdminSession()) return new Response("No autorizado", { status: 401 });
  const params = new URL(request.url).searchParams;
  const query = params.get("q")?.trim().slice(0, 100);
  const activityValue = params.get("actividad") ?? "";
  const activityId = z.uuid().safeParse(activityValue).success ? activityValue : undefined;
  const rawStatus = params.get("estado");
  const status = rawStatus === "pending" || rawStatus === "partial" || rawStatus === "complete" ? rawStatus : undefined;
  const first = await getMemberGroupAdminList({ activityId, query, status, page: 1, pageSize: 100 });
  if (first.total > 5000) return new Response("La exportación supera 5000 solicitudes. Aplica filtros más específicos.", { status: 413 });
  const groups = [...first.items];
  for (let page = 2; page <= Math.ceil(first.total / 100); page += 1) {
    const next = await getMemberGroupAdminList({ activityId, query, status, page, pageSize: 100 });
    groups.push(...next.items);
  }
  const client = await createServerSupabaseClient();
  const seats: MemberGroupExportSeat[] = [];
  for (let offset = 0; offset < groups.length; offset += 100) {
    const ids = groups.slice(offset, offset + 100).map((group) => group.id);
    const { data, error } = await client.from("registrations")
      .select("member_group_request_id, registration_code, first_names_snapshot, last_names_snapshot, status, price_snapshot, person:people!inner(document_type, document_number, email)")
      .in("member_group_request_id", ids).is("deleted_at", null);
    if (error) throw new Error("No se pudieron exportar los asistentes.", { cause: error });
    seats.push(...(data ?? []).map((item) => ({
      requestId: item.member_group_request_id ?? "", code: item.registration_code,
      firstNames: item.first_names_snapshot ?? "", lastNames: item.last_names_snapshot ?? "",
      document: `${item.person.document_type.toUpperCase()} ${item.person.document_number}`,
      email: item.person.email, status: item.status, price: item.price_snapshot,
    })));
  }
  return new Response(memberGroupsToCsv(groups, seats), {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="solicitudes-asociados-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
