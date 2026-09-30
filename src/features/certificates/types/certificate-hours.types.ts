import type { CertificateRegenerationState } from "@/features/certificates/types/certificate.types";

export interface CertificateHoursRegenerationState extends CertificateRegenerationState {
  hasMore?: boolean;
}

export interface CertificateHoursRegenerationProps {
  academicHours: number | null;
  activityId: string;
}
