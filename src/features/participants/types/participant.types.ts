import type { ActivityType } from "@/features/activities/types/activity.types";
import type { AttendanceStatus } from "@/features/attendance/types/attendance.types";
import type { CertificateStatus, CertificateType } from "@/features/certificates/types/certificate.types";
import type { ParticipantProfile, RegistrationStatus, RegistrationType } from "@/features/registrations/types/registration.types";
import type { Tables } from "@/lib/supabase/database.types";

export type ParticipantRow = Tables<"people">;

export interface ParticipantListItem extends Pick<ParticipantRow,
  "academic_institution" | "career" | "company" | "document_number" |
  "document_type" | "email" | "first_names" | "id" | "job_title" |
  "last_names" | "participant_profile" | "phone" | "ruc"
> {
  registrations: Array<{ id: string }>;
}

export interface ParticipantHistoryItem {
  academic_institution_snapshot: string | null;
  activity: { id: string; slug: string; title: string; type: ActivityType };
  attendance: Array<{ status: AttendanceStatus }>;
  company_snapshot: string | null;
  career_snapshot: string | null;
  created_at: string;
  id: string;
  job_title_snapshot: string | null;
  participant_profile: ParticipantProfile;
  price_snapshot: number;
  registration_code: string;
  registration_type: RegistrationType;
  ruc_snapshot: string | null;
  status: RegistrationStatus;
}

export interface ParticipantCertificateItem {
  certificate_code: string;
  certificate_type: CertificateType;
  id: string;
  issued_at: string;
  participant_name_snapshot: string;
  revocation_reason: string | null;
  status: CertificateStatus;
  title_snapshot: string;
}

export interface ParticipantDetail extends Pick<ParticipantRow,
  "academic_institution" | "address" | "career" | "company" | "created_at" |
  "document_number" | "document_type" | "email" | "first_names" | "id" |
  "job_title" | "last_names" | "participant_profile" | "phone" | "ruc"
> {
  certificates: ParticipantCertificateItem[];
  registrations: ParticipantHistoryItem[];
}

export interface ParticipantFilters { page: number; query?: string }
export interface ParticipantPage {
  page: number;
  pageCount: number;
  participants: ParticipantListItem[];
  total: number;
}
export interface AdminParticipantsPageProps {
  searchParams: Promise<{ pagina?: string | string[]; q?: string | string[] }>;
}
export interface ParticipantDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ actualizado?: string | string[] }>;
}
export interface ParticipantFormState {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
}
