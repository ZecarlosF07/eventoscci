import type { ActivityCertificateMode } from "@/features/activities/types/activity-certificate.types";

export interface CertificateRequestAdminRegistration {
  activity: { certificate_mode: ActivityCertificateMode };
  certificate_followed_up_at: string | null;
  certificate_mode_snapshot: ActivityCertificateMode;
  certificate_price_snapshot: number | null;
  certificate_requested_at: string | null;
  id: string;
}

export interface CertificateRequestAdminStatusProps {
  registration: CertificateRequestAdminRegistration;
  returnTo: string;
}
