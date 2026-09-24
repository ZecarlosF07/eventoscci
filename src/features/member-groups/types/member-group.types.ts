import type { ActivityRegistrationContext } from "@/features/registrations/types/registration.types";

export interface MemberAttendeeInput {
  document_type: "dni" | "ce";
  document_number: string;
  first_names: string;
  last_names: string;
  email: string;
  phone: string;
  job_title: string;
  request_certificate: boolean;
}

export interface MemberBillingInput {
  type: "boleta" | "factura";
  document: string;
  name: string;
  address?: string;
}

export interface MemberGroupInput {
  attendees: MemberAttendeeInput[];
  billing: MemberBillingInput | null;
  future_topics_suggestion: string;
  ruc: string;
}

export interface MemberGroupAttendeeResult {
  first_names: string;
  last_names: string;
  price: number;
  registration_code: string;
  status: "pending" | "confirmed" | "cancelled";
}

export interface MemberGroupResult {
  activity_slug: string;
  activity_title: string;
  activity_type: "event";
  attendees: MemberGroupAttendeeResult[];
  company_name: string;
  company_ruc: string;
  confirmed_amount: number;
  confirmed_count: number;
  contact_whatsapp_phone: string | null;
  is_free: boolean;
  pending_amount: number;
  pending_count: number;
  request_code: string;
  request_id: string;
  total: number;
}

export interface MemberGroupSubmissionResult {
  access_token: string;
  group: MemberGroupResult;
  replayed: boolean;
}

export interface MemberGroupRegistrationFormProps {
  activity: ActivityRegistrationContext;
}

export interface MemberAttendeeFieldsProps {
  attendee: MemberAttendeeInput;
  certificateMode: ActivityRegistrationContext["certificateMode"];
  certificatePrice: number;
  index: number;
  errors?: Record<string, string>;
  onChange: (next: MemberAttendeeInput) => void;
  onRemove?: () => void;
}

export interface MemberBillingFieldsProps {
  billing: MemberBillingInput;
  companyName: string;
  companyRuc: string;
  errors?: Record<string, string>;
  onChange: (next: MemberBillingInput) => void;
}

export interface MemberGroupAdminListItem {
  age_days: number;
  id: string;
  activity_id: string;
  activity_title: string;
  billing_document: string | null;
  billing_type: string | null;
  company_name_snapshot: string;
  company_ruc: string;
  confirmed_amount: number;
  confirmed_count: number;
  coordinator_email: string | null;
  coordinator_name: string;
  created_at: string;
  group_status: "pending" | "partial" | "complete";
  pending_amount: number;
  pending_count: number;
  request_code: string;
  seat_count: number;
  total: number;
}

export interface MemberGroupAdminList {
  items: MemberGroupAdminListItem[];
  total: number;
  ruc_summary: { requests: number; seats: number; total: number; pending: number } | null;
}

export interface MemberGroupAdminDetail {
  activity: { id: string; title: string; slug: string };
  attendees: {
    id: string; code: string; firstNames: string; lastNames: string;
    document: string; email: string; phone: string; jobTitle: string | null;
    price: number; status: "pending" | "confirmed" | "cancelled";
    attendance: string; certificate: string | null;
  }[];
  payments: { id: string; amount: number; reference: string; note: string | null; verifiedAt: string; verifiedByName: string; seats: string[] }[];
  request: {
    id: string; code: string; companyRuc: string; companyName: string;
    billingType: string | null; billingDocument: string | null;
    billingName: string | null; billingAddress: string | null;
    createdAt: string; coordinatorEmail: string | null; isFree: boolean;
    ageDays: number;
  };
}
