import "server-only";

import type { AdminSession } from "@/features/auth/types/auth.types";
import { getCurrentAccount } from "@/features/auth/queries/get-current-account";
import { requireInternalAccount } from "@/features/auth/services/account-guards";

export async function getAdminSession(): Promise<AdminSession | null> {
  const account = await getCurrentAccount();
  if (!account?.isActive || account.role === "student") return null;
  return account;
}

export async function requireAdmin(): Promise<AdminSession> {
  return requireInternalAccount();
}
