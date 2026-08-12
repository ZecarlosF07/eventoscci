import type { ActivityType } from "@/features/activities/types/activity.types";
import type { Enums, Tables } from "@/lib/supabase/database.types";

export type RegistrationType = Enums<"registration_type">;
export type RegistrationStatus = Enums<"registration_status">;
export type RegistrationRow = Tables<"registrations">;

export interface RegistrationInput {
  address: string;
  company: string;
  document_number: string;
  document_type: Enums<"document_type">;
  email: string;
  first_names: string;
  job_title: string;
  last_names: string;
  phone: string;
  registration_type: RegistrationType;
  ruc: string;
}

export interface RegistrationRpcResult {
  activity_id: string;
  activity_slug: string;
  activity_title: string;
  activity_type: ActivityType;
  attendance_id: string;
  notification_event: string;
  price_snapshot: number;
  registration_code: string;
  registration_id: string;
  status: RegistrationStatus;
}

export interface PublicRegistrationResult {
  activity_slug: string;
  activity_title: string;
  activity_type: ActivityType;
  contact_email: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  is_free: boolean;
  price_snapshot: number;
  registration_code: string;
  status: RegistrationStatus;
}

export type RegistrationAvailabilityReason =
  | "available"
  | "cancelled"
  | "closed"
  | "full"
  | "not_open";

export interface RegistrationAvailability {
  is_open: boolean;
  reason: RegistrationAvailabilityReason;
  remaining_capacity: number | null;
}

export interface RegistrationMutationError {
  code: RegistrationErrorCode;
  fieldErrors?: Record<string, string[]>;
  message: string;
  success: false;
}

export interface RegistrationMutationSuccess {
  data: RegistrationRpcResult;
  success: true;
}

export type RegistrationMutationResult =
  | RegistrationMutationError
  | RegistrationMutationSuccess;

export type RegistrationErrorCode =
  | "ACTIVITY_NOT_FOUND"
  | "DATABASE_ERROR"
  | "DUPLICATE_REGISTRATION"
  | "INVALID_MEMBER_DATA"
  | "NO_AVAILABLE_CAPACITY"
  | "REGISTRATION_CLOSED"
  | "VALIDATION_ERROR";

export interface ActivityRegistrationContext {
  generalPrice: number;
  id: string;
  isFree: boolean;
  memberPrice: number;
  membersOnly: boolean;
  slug: string;
  title: string;
  type: ActivityType;
}

export interface RegistrationAdminItem
  extends Pick<
    RegistrationRow,
    | "company_snapshot"
    | "created_at"
    | "id"
    | "price_snapshot"
    | "registration_code"
    | "registration_type"
    | "ruc_snapshot"
    | "status"
  > {
  activity: Pick<Tables<"activities">, "id" | "slug" | "title" | "type">;
  person: Pick<
    Tables<"people">,
    | "document_number"
    | "document_type"
    | "email"
    | "first_names"
    | "job_title"
    | "last_names"
    | "phone"
  >;
}

export interface RegistrationAdminFilters {
  activityId?: string;
  page: number;
  status?: RegistrationStatus;
}

export interface RegistrationAdminPage {
  page: number;
  pageCount: number;
  registrations: RegistrationAdminItem[];
  total: number;
}

export interface RegistrationRoutePageProps {
  params: Promise<{ slug: string }>;
}

export interface RegistrationResultPageProps extends RegistrationRoutePageProps {
  searchParams: Promise<{ codigo?: string | string[] }>;
}

export interface AdminRegistrationsPageProps {
  searchParams: Promise<{
    actividad?: string | string[];
    estado?: string | string[];
    pagina?: string | string[];
  }>;
}

export interface RegistrationFieldGroupProps {
  errors: Record<string, string[]>;
  isMember?: boolean;
}

export interface RegistrationTypeSelectorProps {
  membersOnly: boolean;
  onChange: (type: RegistrationType) => void;
  value: RegistrationType;
}

export interface RegistrationFormProps {
  activity: ActivityRegistrationContext;
}

export interface RegistrationPageTemplateProps {
  activity: ActivityRegistrationContext;
  availability: RegistrationAvailability;
}

export interface RegistrationPageData {
  activity: ActivityRegistrationContext;
  availability: RegistrationAvailability;
}

export interface RegistrationResultProps {
  result: PublicRegistrationResult;
}

export interface RegistrationCtaProps {
  activitySlug: string;
  activityType: ActivityType;
  availability: RegistrationAvailability;
}

export interface RegistrationsTableProps {
  registrations: RegistrationAdminItem[];
}

export interface RegistrationStatusBadgeProps {
  status: RegistrationStatus;
}

export interface RegistrationsAdminTemplateProps {
  data: RegistrationAdminPage;
  status?: RegistrationStatus;
  title: string;
}
