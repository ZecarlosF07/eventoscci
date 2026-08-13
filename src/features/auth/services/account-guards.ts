import "server-only";

import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { getCurrentAccount } from "@/features/auth/queries/get-current-account";
import type { CurrentAccount } from "@/features/auth/types/auth.types";

export async function requireActiveAccount(): Promise<CurrentAccount> {
  const account = await getCurrentAccount();
  if (!account) redirect(`${ROUTES.login}?error=not-linked`);
  if (!account.isActive) redirect(`${ROUTES.login}?error=inactive`);
  return account;
}

export async function requireInternalAccount(): Promise<CurrentAccount> {
  const account = await requireActiveAccount();
  if (account.role === "student") redirect(ROUTES.campus);
  return account;
}
