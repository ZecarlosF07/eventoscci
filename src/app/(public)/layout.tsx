import { connection } from "next/server";

import { PublicShell } from "@/components/templates/PublicShell";

export default async function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Cache tagged data, not an additional stale HTML snapshot of the public portal.
  await connection();
  return <PublicShell>{children}</PublicShell>;
}
