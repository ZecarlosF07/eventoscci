import type { CertificatePublicData } from "@/features/certificates/types/certificate.types";

export interface CertificatePublicTemplateProps {
  certificate: CertificatePublicData;
  token: string;
}
