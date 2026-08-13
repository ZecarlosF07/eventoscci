import "server-only";

import { cache } from "react";

import type { User } from "@supabase/supabase-js";

import { currentAccountRowSchema } from "@/features/auth/schemas/current-account.schema";
import type { CurrentAccount } from "@/features/auth/types/auth.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { TypedSupabaseClient } from "@/lib/supabase/types/supabase-client.types";

export async function getAccountForUser(
  client: TypedSupabaseClient,
  user: User,
): Promise<CurrentAccount | null> {
  const { data, error } = await client.from("user_accounts")
    .select("user_id, role, is_active, deleted_at, person:people!inner(id, document_type, document_number, first_names, last_names, email, phone, job_title, company, ruc, address)")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !data) return null;
  const parsed = currentAccountRowSchema.safeParse(data);
  if (!parsed.success) return null;
  return {
    email: user.email ?? parsed.data.person.email,
    isActive: parsed.data.is_active && parsed.data.deleted_at === null,
    person: parsed.data.person,
    role: parsed.data.role,
    userId: parsed.data.user_id,
  };
}

export const getCurrentAccount = cache(async (): Promise<CurrentAccount | null> => {
  const client = await createServerSupabaseClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return null;
  return getAccountForUser(client, data.user);
});
