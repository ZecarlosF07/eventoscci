import type { CertificateRegenerationState } from "@/features/certificates/types/certificate.types";

export interface CertificateHoursRegenerationState extends CertificateRegenerationState {
  hasMore?: boolean;
  totalCount?: number;
  remainingCount?: number;
}

export interface CertificateHoursRegenerationProps {
  academicHours: number | null;
  activityId: string;
  outdatedCount: number;
}


export interface CertificateHoursProgress {
  completed: number;
  percentage: number;
  total: number;
}
