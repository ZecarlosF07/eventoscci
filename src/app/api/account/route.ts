import { NextResponse } from "next/server";

import { getCurrentAccount } from "@/features/auth/queries/get-current-account";

export async function GET() {
  const account = await getCurrentAccount();
  const headerAccount = account ? {
    email: account.email,
    firstName: account.person.first_names,
    isActive: account.isActive,
    lastName: account.person.last_names,
    role: account.role,
  } : null;

  return NextResponse.json(
    { account: headerAccount },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
