import type { ActivityType } from "@/features/activities/types/activity.types";
import type { ActivityCertificateMode } from "@/features/activities/types/activity-certificate.types";
import type { RegistrationStatus, RegistrationType } from "@/features/registrations/types/registration.types";
import type { Enums } from "@/lib/supabase/database.types";

export type AttendanceStatus = Enums<"attendance_status">;

export interface AttendanceFilters {
  attendanceStatus?: AttendanceStatus;
  page: number;
  query?: string;
  registrationStatus?: RegistrationStatus;
  registrationType?: RegistrationType;
}

export interface AttendanceItem {
  id: string;
  marked_at: string | null;
  notes: string | null;
  registration: {
    activity: {
      certificate_mode: ActivityCertificateMode;
      id: string;
      status: Enums<"activity_status">;
    };
    attendance: Array<{ status: AttendanceStatus }>;
    certificate: Array<{ id: string; status: "issued" | "revoked" }>;
    certificate_mode_snapshot: ActivityCertificateMode;
    certificate_payment_verified_at: string | null;
    certificate_price_snapshot: number | null;
    certificate_requested_at: string | null;
    certificatePaymentVerifiedByName: string | null;
    certificateRequestedByName: string | null;
    company_snapshot: string | null;
    id: string;
    person: {
      document_number: string;
      email: string;
      first_names: string;
      last_names: string;
      phone: string;
    };
    registration_code: string;
    registration_type: RegistrationType;
    status: RegistrationStatus;
  };
  status: AttendanceStatus;
}

export interface AttendanceActivityData {
  activity: { id: string; title: string; type: ActivityType };
  attendance: AttendanceItem[];
  page: number;
  pageCount: number;
  total: number;
}

export interface AttendanceActivityPageProps {
  params: Promise<{ activityId: string }>;
  searchParams: Promise<{
    asistencia?: string | string[];
    estado?: string | string[];
    pagina?: string | string[];
    q?: string | string[];
    resultado?: string | string[];
    tipo?: string | string[];
  }>;
}
