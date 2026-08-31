import { PublicHeaderClient } from "@/components/organisms/PublicHeader/PublicHeaderClient";
import { getCurrentAccount } from "@/features/auth/queries/get-current-account";

export async function PublicHeader() {
  const account = await getCurrentAccount();
  const headerAccount = account ? {
    email: account.email,
    firstName: account.person.first_names,
    isActive: account.isActive,
    lastName: account.person.last_names,
    role: account.role,
  } : null;
  return <PublicHeaderClient account={headerAccount} />;
}
