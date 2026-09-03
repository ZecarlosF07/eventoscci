import type { PublicCertificateSearchItem } from "@/features/certificates/types/certificate.types";

export interface PublicCertificateResultsProps {
  certificates: PublicCertificateSearchItem[];
  participantName?: string;
}
