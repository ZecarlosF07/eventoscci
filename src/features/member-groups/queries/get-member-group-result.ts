import "server-only";

import { memberGroupResultSchema } from "@/features/member-groups/schemas/member-group.schema";
import type { MemberGroupResult } from "@/features/member-groups/types/member-group.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getMemberGroupResult(code: string, accessToken: string): Promise<MemberGroupResult | null> {
  if (!/^CCI-GR-\d+$/.test(code) || !/^[0-9a-f-]{36}$/i.test(accessToken)) return null;
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("get_member_group_result", {
    p_request_code: code,
    p_access_token: accessToken,
  });
  if (error) throw new Error("No fue posible consultar la solicitud grupal.", { cause: error });
  const parsed = memberGroupResultSchema.safeParse(data);
  return parsed.success ? parsed.data : null;
}
