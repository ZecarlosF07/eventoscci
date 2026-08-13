import type { CertificateCandidate, CertificateTemplate } from "@/features/certificates/types/certificate.types";

export interface CertificateCandidatesTableProps {
  activityId: string;
  candidates: CertificateCandidate[];
  templates: CertificateTemplate[];
}
