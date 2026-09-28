import type { PaymentFilterQuery } from "@/features/participation/types/payment-query.types";
import type { PaymentFilters } from "@/features/participation/types/payment.types";
import { escapePostgrestSearch } from "@/utils/postgrest-search";

export function applyPaymentFilters<T extends PaymentFilterQuery<T>>(source: T, filters: PaymentFilters): T {
  let query = source;
  if (filters.state === "pending") query = query.gt("pending_count", 0);
  if (filters.state === "complete") query = query.eq("status", "complete");
  if (filters.kind !== "all") query = query.eq("kind", filters.kind);
  if (filters.query) query = query.ilike("search_text", `%${escapePostgrestSearch(filters.query)}%`);
  return query;
}
