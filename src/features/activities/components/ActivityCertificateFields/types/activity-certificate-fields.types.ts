import type { ActivityCertificateMode } from "@/features/activities/types/activity-certificate.types";

export interface ActivityCertificateFieldsProps {
  defaultGeneralPrice?: number;
  defaultMemberPrice?: number;
  defaultMode?: ActivityCertificateMode;
  errors?: Record<string, string[]>;
}
