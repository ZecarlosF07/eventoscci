import "server-only";

import { unstable_cache } from "next/cache";

import { PUBLIC_ACTIVITY_PAGE_SIZE } from "@/features/activities/constants/activity.constants";
import { ACTIVITY_LIST_SELECT } from "@/features/activities/constants/activity-query.constants";
import { publicEventPageSchema } from "@/features/activities/schemas/event-catalog.schema";
import type { ActivityFilters, ActivityPublicPage } from "@/features/activities/types/activity.types";
import { getEventCatalogArguments } from "@/features/activities/utils/event-catalog-arguments";
import type { EventCatalogView } from "@/features/activities/types/event-catalog.types";
import { PUBLIC_CACHE_REVALIDATE_SECONDS, PUBLIC_CACHE_TAGS, PUBLIC_CACHE_VERSION } from "@/features/seo/constants/public-cache.constants";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

export const getPublicEventPage = unstable_cache(
  async (view: EventCatalogView, filters: ActivityFilters, pageSize = PUBLIC_ACTIVITY_PAGE_SIZE): Promise<ActivityPublicPage> => {
    const emptyPage = { activities: [], page: filters.page, pageCount: 1, total: 0 };
    const args = getEventCatalogArguments(view, filters, pageSize);
    if (!args) return emptyPage;
    const client = createPublicSupabaseClient();
    const { data, error } = await client.rpc("get_public_event_page", args);
    if (error) throw new Error("No fue posible consultar la agenda de eventos.", { cause: error });
    const result = publicEventPageSchema.parse(data);
    const page = { ...emptyPage, pageCount: Math.max(1, Math.ceil(result.total / pageSize)), total: result.total };
    if (!result.activity_ids.length) return page;

    const { data: activities, error: detailError } = await client.from("activities")
      .select(ACTIVITY_LIST_SELECT)
      .in("id", result.activity_ids)
      .eq("type", "event")
      .eq("is_listed", true)
      .in("status", view === "past" ? ["published", "finished"] : ["published", "cancelled"])
      .is("deleted_at", null)
      .not("published_at", "is", null)
      .is("activity_dates.deleted_at", null);
    if (detailError) throw new Error("No fue posible consultar las fichas de eventos.", { cause: detailError });
    const byId = new Map((activities ?? []).map((activity) => [activity.id, activity]));
    return { ...page, activities: result.activity_ids.flatMap((id) => {
      const activity = byId.get(id);
      return activity ? [activity] : [];
    }) };
  }, ["public-event-page", PUBLIC_CACHE_VERSION], {
    revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
    tags: [PUBLIC_CACHE_TAGS.activities],
  },
);
