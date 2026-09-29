import type { ReactNode } from "react";

import type { ActivityStatus } from "@/features/activities/types/activity.types";
import type { Database } from "@/lib/supabase/database.types";

export type PaymentRequest = Database["public"]["Views"]["participation_payment_requests"]["Row"];
export type CertificatePaymentRequest = Database["public"]["Views"]["certificate_payment_requests"]["Row"];
export type PaymentState = "pending" | "complete" | "all";
export type PaymentKind = "individual" | "group" | "all";
export type PaymentSearchParams = Record<string, string | string[] | undefined>;
export interface PaymentFilters {
  page: number;
  certificatePage: number;
  state: PaymentState;
  certificateState: PaymentState;
  kind: PaymentKind;
  query: string;
  requestId?: string;
  certificateId?: string;
}
export interface PaymentPage<T> { items: T[]; total: number; page: number; pageCount: number; outsideResultId?: string }
export interface IndividualPaymentInput {
  registrationId: string;
  receivedAmount: number;
  reference: string;
  note: string;
  idempotencyKey: string;
}
export interface IndividualPaymentFormProps { registrationId: string; price: number; onVerified?: () => void }
export interface PaymentFiltersProps { filters: PaymentFilters }
export interface PaymentRequestDetailProps { activityId: string }
export interface PaymentRequestDialogProps { children?: ReactNode; onClose: () => void; requestId: string; title?: string; dialogId?: string; headingId?: string }
export interface ActivityPaymentsPageProps {
  params: Promise<{ activityId: string }>;
  searchParams: Promise<PaymentSearchParams>;
}
export interface LegacyPaymentPageProps { searchParams: Promise<PaymentSearchParams> }
export interface PaymentListProps { items: PaymentRequest[]; activityId: string; filters: PaymentFilters }
export interface PaymentTableRowProps { item: PaymentRequest; activityId: string; filters: PaymentFilters }
export interface CertificatePaymentsProps {
  activityStatus: ActivityStatus;
  data: PaymentPage<CertificatePaymentRequest>;
  activityId: string;
  filters: PaymentFilters;
  returnTo: string;
}
export interface PaymentHistoryEntry {
  id: string; amount: number; payment_reference: string; note: string | null;
  verified_at: string; verifiedByName: string;
}
