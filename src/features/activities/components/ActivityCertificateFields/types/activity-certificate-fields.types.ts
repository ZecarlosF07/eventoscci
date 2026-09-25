import type { ActivityCertificateMode } from "@/features/activities/types/activity-certificate.types";

export interface ActivityCertificateFieldsProps {
  defaultAcademicHours?: number | null;
  defaultGeneralPrice?: number;
  defaultMemberPrice?: number;
  defaultMode?: ActivityCertificateMode;
  errors?: Record<string, string[]>;
  membersOnly: boolean;
  preserveHistoricalHours?: boolean;
}
