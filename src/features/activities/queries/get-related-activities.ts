import "server-only";

import { ACTIVITY_LIST_SELECT } from "@/features/activities/queries/get-public-activities";
import type {
  ActivityDetail,
  ActivityListItem,
} from "@/features/activities/types/activity.types";
import { selectRelatedActivities } from "@/features/activities/utils/related-activities";
import { registrationAvailabilitySchema } from "@/features/registrations/schemas/registration.schema";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getRelatedActivities(
  activity: ActivityDetail,
): Promise<ActivityListItem[]> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client
    .from("activities")
    .select(ACTIVITY_LIST_SELECT)
    .eq("status", "published")
    .neq("id", activity.id)
    .is("deleted_at", null)
    .not("published_at", "is", null)
    .is("activity_dates.deleted_at", null);

  if (error) {
    throw new Error("No fue posible consultar actividades recomendadas.", {
      cause: error,
    });
  }

  const ranked = selectRelatedActivities(data, activity, new Date(), 12);
  const availabilityResults = await Promise.all(
    ranked.map((candidate) => client.rpc("get_activity_registration_availability", {
      p_activity_id: candidate.id,
    })),
  );

  return ranked
    .filter((_, index) => {
      const result = availabilityResults[index];
      if (result.error) return false;
      const availability = registrationAvailabilitySchema.safeParse(result.data);
      return availability.success && availability.data.is_open;
    })
    .slice(0, 3);
}
