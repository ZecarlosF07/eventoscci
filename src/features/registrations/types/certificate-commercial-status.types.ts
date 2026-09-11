import type { ActivityCertificateMode } from "@/features/activities/types/activity-certificate.types";
import type { AttendanceStatus } from "@/features/attendance/types/attendance.types";
import type { CertificateStatus } from "@/features/certificates/types/certificate.types";
import type { RegistrationStatus } from "@/features/registrations/types/registration.types";

export type CertificateCommercialStatus =
  | "included_pending_attendance"
  | "issued"
  | "not_requested"
  | "payment_pending"
  | "payment_verified_pending_attendance"
  | "ready_to_issue"
  | "revoked"
  | "unavailable";

export interface CertificateCommercialStatusInput {
  attendanceStatus: AttendanceStatus;
  certificateMode: ActivityCertificateMode;
  certificatePaymentVerifiedAt: string | null;
  certificateRequestedAt: string | null;
  certificateStatus?: CertificateStatus | null;
  currentMode?: ActivityCertificateMode;
  registrationStatus: RegistrationStatus;
}
