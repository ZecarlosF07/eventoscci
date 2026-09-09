import type { Metadata } from "next";

import { AdminShell } from "@/components/templates/AdminShell";
import { requireAdmin } from "@/features/auth/services/admin-session";
import { buildNoIndexMetadata } from "@/features/seo/services/build-page-metadata";

export const metadata: Metadata = buildNoIndexMetadata("Administración CCI");

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdmin();

  return (
    <AdminShell email={session.email} name={`${session.person.first_names} ${session.person.last_names}`}>{children}</AdminShell>
  );
}
