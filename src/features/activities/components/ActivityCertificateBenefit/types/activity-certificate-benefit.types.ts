import type { ActivityCertificateMode } from "@/features/activities/types/activity-certificate.types";

export interface ActivityCertificateBenefitProps {
  generalPrice: number;
  isActivityFree: boolean;
  memberPrice: number;
  mode: ActivityCertificateMode;
}
