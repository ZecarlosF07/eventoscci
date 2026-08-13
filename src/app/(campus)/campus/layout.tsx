import { CampusShell } from "@/components/templates/CampusShell";
import { requireActiveAccount } from "@/features/auth/services/account-guards";

export default async function CampusLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const account = await requireActiveAccount();
  return <CampusShell account={account}>{children}</CampusShell>;
}
