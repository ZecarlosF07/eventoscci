import type { BillingFilterQuery, BillingFilters } from "@/features/billing/types/billing.types";
import { escapePostgrestSearch } from "@/utils/postgrest-search";

export function applyBillingFilters<T extends BillingFilterQuery<T>>(source: T, filters: BillingFilters): T {
  let query = source;
  if (filters.state !== "all") query = query.eq("status", filters.state);
  if (filters.type !== "all") query = query.eq(["missing", "not_required"].includes(filters.type) ? "billing_state" : "billing_type", filters.type);
  if (filters.query) query = query.ilike("search_text", `%${escapePostgrestSearch(filters.query)}%`);
  return query;
}
