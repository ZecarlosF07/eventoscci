import type { Metadata } from "next";

import { CampusShell } from "@/components/templates/CampusShell";
import { requireActiveAccount } from "@/features/auth/services/account-guards";
import { buildNoIndexMetadata } from "@/features/seo/services/build-page-metadata";

export const metadata: Metadata = buildNoIndexMetadata("Campus CCI");

export default async function CampusLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const account = await requireActiveAccount();
  return <CampusShell account={account}>{children}</CampusShell>;
}
