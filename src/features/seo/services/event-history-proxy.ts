import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { PUBLIC_ACTIVITY_PAGE_SIZE } from "@/features/activities/constants/activity.constants";
import { publicEventPageSchema } from "@/features/activities/schemas/event-catalog.schema";
import { parsePublicFilters } from "@/features/activities/types/activity-page.types";
import { getEventCatalogArguments } from "@/features/activities/utils/event-catalog-arguments";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

function missingHistoryPage(request: NextRequest) {
  // Reuse the existing 404 UI before streaming starts instead of returning a soft 404.
  return NextResponse.rewrite(new URL("/_not-found", request.url), {
    status: 404,
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });
}

export async function getEventHistoryProxyResponse(request: NextRequest) {
  if (request.method !== "GET" && request.method !== "HEAD") return NextResponse.next();
  const filters = parsePublicFilters(Object.fromEntries(request.nextUrl.searchParams));
  const args = getEventCatalogArguments("past", filters);
  if (!args) return missingHistoryPage(request);
  // Page 1 is valid even when there are no events. No extra query on the main history URL.
  if (filters.page === 1) return NextResponse.next();
  const { data, error } = await createPublicSupabaseClient().rpc("get_public_event_page", args);
  if (error) throw new Error("No fue posible validar la página del historial.", { cause: error });
  const result = publicEventPageSchema.parse(data);
  return filters.page > Math.max(1, Math.ceil(result.total / (args.p_page_size ?? PUBLIC_ACTIVITY_PAGE_SIZE)))
    ? missingHistoryPage(request) : NextResponse.next();
}
