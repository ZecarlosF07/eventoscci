import type { ActivityListItem } from "@/features/activities/types/activity.types";
import type { CertificatePublicData } from "@/features/certificates/types/certificate.types";

export interface CertificatePublicTemplateProps {
  accountHref: string;
  accountLabel: string;
  certificate: CertificatePublicData;
  recommendations: ActivityListItem[];
  token: string;
}
