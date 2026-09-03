import type { ActivityListItem, ActivityType } from "@/features/activities/types/activity.types";
import type { AttendanceStatus } from "@/features/attendance/types/attendance.types";
import type { RegistrationStatus } from "@/features/registrations/types/registration.types";
import type { Enums, Json, Tables } from "@/lib/supabase/database.types";

export type CertificateStatus = Enums<"certificate_status">;
export type CertificateType = Enums<"certificate_type">;
export type CertificateRow = Tables<"certificates">;

export interface CertificateSigner {
  id: string;
  signature_path: string | null;
  signer_name: string;
  signer_title: string | null;
  sort_order: number;
}

export interface CertificateTemplate {
  background_path: string | null;
  id: string;
  is_active: boolean;
  is_default: boolean;
  name: string;
  scope: CertificateType;
  signers: CertificateSigner[];
  template_config: Json;
  updated_at: string;
}

export interface CertificateActivityOption {
  id: string;
  title: string;
  type: ActivityType;
  eligibleCount: number;
  issuedCount: number;
}

export interface CertificateCandidate {
  attendance: { status: AttendanceStatus };
  certificate: Pick<CertificateRow, "certificate_code" | "file_path" | "id" | "status"> | null;
  company_snapshot: string | null;
  id: string;
  person: {
    document_number: string;
    email: string;
    first_names: string;
    last_names: string;
  };
  registration_code: string;
  status: RegistrationStatus;
}

export interface ActivityCertificateData {
  activity: { id: string; title: string; type: ActivityType };
  candidates: CertificateCandidate[];
  templates: CertificateTemplate[];
}

export interface CertificateAdminItem extends Pick<CertificateRow,
  "certificate_code" | "certificate_type" | "condition_snapshot" | "file_path" | "id" | "issued_at" |
  "participant_name_snapshot" | "revocation_reason" | "status" | "title_snapshot"
> {
  registration: { activity_id: string } | null;
}

export interface MyCertificate {
  accessToken: string;
  academicHours: number | null;
  certificateCode: string;
  certificateType: CertificateType;
  condition: string | null;
  courseId: string | null;
  fileReady: boolean;
  id: string;
  issuedAt: string;
  revocationReason: string | null;
  status: CertificateStatus;
  title: string;
}

export interface MyCertificatesListProps {
  certificates: MyCertificate[];
}

export interface CertificateGenerationStatusProps {
  certificateId: string;
  fileReady: boolean;
}

export type CertificateGenerationState = "error" | "pending" | "ready";

export interface CourseCertificateGenerationRouteContext {
  params: Promise<{ certificateId: string }>;
}

export interface CertificateAdminPage {
  certificates: CertificateAdminItem[];
  page: number;
  pageCount: number;
  total: number;
}

export interface CertificatePublicData {
  academic_hours: number | null;
  certificate_code: string;
  certificate_type: CertificateType;
  condition: string | null;
  date_text: string | null;
  download_available: boolean;
  issued_at: string;
  participant_name: string;
  revocation_reason: string | null;
  revoked_at: string | null;
  status: CertificateStatus;
  source_activity_id: string | null;
  source_activity_type: ActivityType | null;
  source_category_id: string | null;
  title: string;
}

export type PublicCertificateSearchStatus = "error" | "found" | "idle" | "invalid" | "not_found" | "rate_limited";

export interface PublicCertificateSearchItem {
  access_token: string;
  academic_hours: number | null;
  certificate_code: string;
  certificate_type: CertificateType;
  condition: string | null;
  date_text: string | null;
  download_available: boolean;
  issued_at: string;
  participant_name: string;
  revocation_reason: string | null;
  status: CertificateStatus;
  title: string;
}

export interface CertificateRecommendationContext {
  source_activity_id: string;
  source_activity_type: ActivityType;
  source_category_id: string | null;
}

export interface PublicCertificateSearchState {
  certificates: PublicCertificateSearchItem[];
  message?: string;
  participantName?: string;
  recommendations: ActivityListItem[];
  status: PublicCertificateSearchStatus;
}

export interface CertificateQueryLogFilters {
  dateFrom?: string;
  dateTo?: string;
  documentNumber?: string;
  outcome?: Exclude<PublicCertificateSearchStatus, "error" | "idle">;
  page: number;
}

export interface CertificateQueryLogItem {
  actorLabel: string | null;
  createdAt: string;
  documentNumber: string;
  id: string;
  ipAddress: string | null;
  outcome: Exclude<PublicCertificateSearchStatus, "error" | "idle">;
  resultCount: number;
  userAgent: string | null;
}

export interface CertificateQueryLogPage {
  items: CertificateQueryLogItem[];
  page: number;
  pageCount: number;
  total: number;
}

export interface CertificateDocumentInput {
  academicHours: number | null;
  accessUrl: string;
  backgroundBytes?: Uint8Array;
  certificateCode: string;
  certificateType: CertificateType;
  condition: string | null;
  dateText: string | null;
  participantName: string;
  signers: CertificateDocumentSigner[];
  title: string;
}

export interface CertificateDocumentSigner extends Omit<CertificateSigner, "id"> {
  signatureBytes?: Uint8Array;
}

export interface CertificateGenerationData extends Pick<CertificateRow,
  "access_token" | "academic_hours_snapshot" | "certificate_code" | "certificate_type" |
  "condition_snapshot" | "date_text_snapshot" | "file_path" | "id" |
  "participant_name_snapshot" | "status" | "title_snapshot"
> {
  template: CertificateTemplate;
}

export interface CertificateIssueState {
  errorCount?: number;
  issuedCount?: number;
  message?: string;
  success?: boolean;
}

export interface CertificateTemplateFormState {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
}

export interface CertificateRouteProps {
  params: Promise<{ token: string }>;
}

export interface ActivityCertificatesPageProps {
  params: Promise<{ activityId: string }>;
}

export interface CertificatesAdminPageProps {
  searchParams: Promise<{ pagina?: string | string[]; resultado?: string | string[] }>;
}

export interface CertificateQueryLogsPageProps {
  searchParams: Promise<{
    desde?: string | string[];
    dni?: string | string[];
    hasta?: string | string[];
    pagina?: string | string[];
    resultado?: string | string[];
  }>;
}

export interface CertificateTemplateEditPageProps {
  params: Promise<{ id: string }>;
}
