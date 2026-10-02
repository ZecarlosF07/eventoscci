import "server-only";

import { z } from "zod";

import { getActivityPricingConfig } from "@/features/activities/utils/activity-pricing";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getRegistrationPricing(activityId: string) {
  if (!z.uuid().safeParse(activityId).success) return null;
  const client = await createServerSupabaseClient();
  const { data, error } = await client.from("activities")
    .select("type,is_free,general_price,member_price,presale_general_price,presale_member_price,presale_ends_at")
    .eq("id", activityId).eq("status", "published").is("deleted_at", null).maybeSingle();
  if (error || !data) return null;
  return getActivityPricingConfig(data);
}
