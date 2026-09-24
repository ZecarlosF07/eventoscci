import "server-only";

import { memberGroupAdminListSchema } from "@/features/member-groups/schemas/member-group.schema";
import type { MemberGroupAdminList } from "@/features/member-groups/types/member-group.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getMemberGroupAdminList(filters: {
  activityId?: string;
  page: number;
  pageSize?: number;
  query?: string;
  status?: "pending" | "partial" | "complete";
}): Promise<MemberGroupAdminList> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("list_member_group_requests", {
    p_activity_id: filters.activityId || undefined,
    p_page: filters.page,
    p_page_size: filters.pageSize ?? 20,
    p_query: filters.query || undefined,
    p_status: filters.status || undefined,
  });
  if (error) throw new Error("No se pudieron cargar las solicitudes grupales.", { cause: error });
  return memberGroupAdminListSchema.parse(data);
}
