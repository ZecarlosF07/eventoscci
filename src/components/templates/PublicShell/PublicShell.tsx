import { WhatsAppCommunityButton } from "@/components/atoms/WhatsAppCommunityButton";
import { PublicFooter } from "@/components/organisms/PublicFooter";
import { PublicHeader } from "@/components/organisms/PublicHeader";
import type { PublicShellProps } from "@/components/templates/PublicShell/types/public-shell.types";
import { PublicAccountProvider } from "@/features/auth/components/PublicAccountProvider";

export function PublicShell({ children }: PublicShellProps) {
  return (
    <PublicAccountProvider>
      <div className="flex min-h-screen flex-col bg-cci-50">
        <PublicHeader />
        <main className="flex-1">{children}</main>
        <PublicFooter />
        <WhatsAppCommunityButton />
      </div>
    </PublicAccountProvider>
  );
}
