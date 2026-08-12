import "server-only";

import { cache } from "react";

import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import type { AdminSession } from "@/features/auth/types/auth.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError || !user?.email) {
    return null;
  }

  const { data: isAdmin, error: roleError } = await client.rpc(
    "is_active_admin",
  );

  if (roleError || !isAdmin) {
    return null;
  }

  return { email: user.email, userId: user.id };
});

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();

  if (!session) {
    redirect(ROUTES.adminLogin);
  }

  return session;
}
