import type { CertificateBatchStatus } from "@/features/certificates/types/certificate-batch.types";

export interface CertificateBatchControlProps {
  activityId: string;
  initialBatch: CertificateBatchStatus | null;
  readyCount: number;
  recoverableCount: number;
  templatesAvailable: boolean;
}
