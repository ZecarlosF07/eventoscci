import type { ActivityCertificateMode } from "@/features/activities/types/activity-certificate.types";
import type { ActivityStatus } from "@/features/activities/types/activity.types";
import type { AttendanceStatus } from "@/features/attendance/types/attendance.types";
import type { CertificateStatus } from "@/features/certificates/types/certificate.types";
import type { RegistrationStatus } from "@/features/registrations/types/registration.types";

export interface CertificateRequestAdminRegistration {
  activity: { certificate_mode: ActivityCertificateMode; id: string; status: ActivityStatus };
  attendance: Array<{ status: AttendanceStatus }>;
  certificate: Array<{ id: string; status: CertificateStatus }>;
  certificate_mode_snapshot: ActivityCertificateMode;
  certificate_payment_verified_at: string | null;
  certificate_price_snapshot: number | null;
  certificate_requested_at: string | null;
  certificatePaymentVerifiedByName: string | null;
  certificateRequestedByName: string | null;
  id: string;
  person: { first_names: string; last_names: string };
  status: RegistrationStatus;
}

export interface CertificateRequestAdminStatusProps {
  registration: CertificateRequestAdminRegistration;
  returnTo: string;
}
