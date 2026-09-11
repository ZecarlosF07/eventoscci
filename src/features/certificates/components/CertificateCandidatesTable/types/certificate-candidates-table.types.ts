import type { CertificateCandidate, CertificateTemplate } from "@/features/certificates/types/certificate.types";
import type { ActivityCertificateMode } from "@/features/activities/types/activity-certificate.types";

export interface CertificateCandidatesTableProps {
  activityId: string;
  certificateMode: ActivityCertificateMode;
  candidates: CertificateCandidate[];
  templates: CertificateTemplate[];
}
