import { SectionHeading } from "@/components/molecules/SectionHeading";
import { requireAdmin } from "@/features/auth/services/admin-session";
import { CertificateAdminNavigation } from "@/features/certificates/components/CertificateAdminNavigation";
import type { CertificateLayoutProps } from "@/features/certificates/types/certificate-layout.types";

export default async function CertificatesLayout({ children }: CertificateLayoutProps) {
  const account = await requireAdmin();
  return (
    <div className="space-y-8">
      <SectionHeading
        description="Emite, configura y audita documentos institucionales desde un flujo organizado."
        eyebrow="Emisión institucional"
        title="Certificados"
      />
      <CertificateAdminNavigation canViewAudit={account.role === "administrator"} />
      {children}
    </div>
  );
}
