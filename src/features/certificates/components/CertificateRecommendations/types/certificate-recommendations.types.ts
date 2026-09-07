import type { ActivityListItem } from "@/features/activities/types/activity.types";

export interface CertificateRecommendationsProps {
  emphasized?: boolean;
  recommendations: ActivityListItem[];
}
