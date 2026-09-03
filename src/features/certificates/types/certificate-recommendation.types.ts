import type { ActivityListItem } from "@/features/activities/types/activity.types";
import type { CertificateRecommendationContext } from "@/features/certificates/types/certificate.types";

export interface CertificateRecommendationSelection {
  activities: ActivityListItem[];
  context: CertificateRecommendationContext | null;
  limit?: number;
  now?: Date;
}
