import type { ActivityType } from "@/features/activities/types/activity.types";
import type { RegistrationStatus, RegistrationType } from "@/features/registrations/types/registration.types";
import type { Enums } from "@/lib/supabase/database.types";

export type AttendanceStatus = Enums<"attendance_status">;

export interface AttendanceActivityOption {
  id: string;
  registrationCount: number;
  status: Enums<"activity_status">;
  title: string;
  type: ActivityType;
}

export interface AttendanceFilters {
  attendanceStatus?: AttendanceStatus;
  query?: string;
  registrationStatus?: RegistrationStatus;
  registrationType?: RegistrationType;
}

export interface AttendanceItem {
  id: string;
  marked_at: string | null;
  notes: string | null;
  registration: {
    company_snapshot: string | null;
    id: string;
    person: {
      document_number: string;
      email: string;
      first_names: string;
      last_names: string;
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
}

export interface AttendanceActivityPageProps {
  params: Promise<{ activityId: string }>;
  searchParams: Promise<{
    asistencia?: string | string[];
    estado?: string | string[];
    q?: string | string[];
    resultado?: string | string[];
    tipo?: string | string[];
  }>;
}
