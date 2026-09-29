import type { CertificateCandidate, CertificateTemplate } from "@/features/certificates/types/certificate.types";
import type { ActivityCertificateMode } from "@/features/activities/types/activity-certificate.types";
import type { CertificateBatchStatus } from "@/features/certificates/types/certificate-batch.types";

export interface CertificateCandidatesTableProps {
  activityId: string;
  batch: CertificateBatchStatus | null;
  certificateMode: ActivityCertificateMode;
  candidates: CertificateCandidate[];
  readyCount: number;
  recoverableCount: number;
  templates: CertificateTemplate[];
}
