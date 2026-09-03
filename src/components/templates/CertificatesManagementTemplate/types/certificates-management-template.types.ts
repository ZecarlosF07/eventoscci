import type { CertificateAdminPage } from "@/features/certificates/types/certificate.types";

export interface CertificatesManagementTemplateProps {
  canViewAudit: boolean;
  data: CertificateAdminPage;
}
