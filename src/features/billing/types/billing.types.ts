import type { ReactNode } from "react";
import type { Database } from "@/lib/supabase/database.types";

export interface BillingInput { type: "boleta" | "factura"; document: string; name: string; address?: string }
export interface BillingSource { documentType?: string; document: string; name: string; address?: string }
export interface BillingFieldsProps {
  billing: BillingInput; onChange: (value: BillingInput) => void; errors?: Record<string, string>;
  source?: () => BillingSource; sourceLabel?: string;
}
export interface IndividualBillingFieldsProps extends Pick<BillingFieldsProps, "billing" | "onChange" | "errors"> { allowCompanyCopy: boolean }
export type BillingRequest = Database["public"]["Views"]["participation_billing_requests"]["Row"];
export type BillingCompany = Database["public"]["Functions"]["get_participation_billing_companies"]["Returns"][number];
export interface BillingFilters { query: string; type: string; state: string; page: number; companyPage: number; company?: string; requestId?: string }
export interface BillingListProps { items: BillingRequest[]; activityId: string; filters: BillingFilters }
export interface BillingDetailProps { item: BillingRequest; activityId: string; filters: BillingFilters }
export interface BillingPageProps { activityId: string; query: Record<string, string | string[] | undefined> }
export interface BillingWorkspaceTabsProps { activityId: string; current: "payments" | "billing" }
export interface BillingToolbarProps { filters: BillingFilters; total: number }
export interface CopyBillingProps { text: string }
export interface BillingCompaniesProps { companies: BillingCompany[]; activityId: string; filters: BillingFilters; children?: ReactNode }
export interface BillingFilterQuery<T> { eq(column: string, value: string): T; ilike(column: string, value: string): T }
export interface BillingPage<T> { items: T[]; total: number; page: number; pageCount: number }
export interface BillingPaginationProps { activityId: string; filters: BillingFilters; page: number; pageCount: number; company?: boolean }
export interface BillingEditorProps { item: BillingRequest }
export interface BillingCorrectionInput { kind: "individual" | "group"; id: string; billing: BillingInput; reason: string }
