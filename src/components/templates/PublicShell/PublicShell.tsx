import { PublicFooter } from "@/components/organisms/PublicFooter";
import { PublicHeader } from "@/components/organisms/PublicHeader";
import type { PublicShellProps } from "@/components/templates/PublicShell/types/public-shell.types";

export function PublicShell({ children }: PublicShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-cci-50">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
