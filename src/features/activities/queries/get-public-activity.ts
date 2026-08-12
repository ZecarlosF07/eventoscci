import "server-only";

import { PUBLIC_ACTIVITY_STATUSES } from "@/features/activities/constants/activity.constants";
import type {
  ActivityDetail,
  ActivityType,
} from "@/features/activities/types/activity.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const ACTIVITY_DETAIL_SELECT = `
  *,
  category:categories!activities_category_id_fkey(id, name, slug),
  dates:activity_dates(*),
  speaker_links:activity_speakers(
    role_label, sort_order,
    speaker:speakers!activity_speakers_speaker_id_fkey(
      id, first_names, last_names, professional_title, organization, bio, photo_path
    )
  )
`;

export async function getPublicActivityBySlug(
  type: ActivityType,
  slug: string,
): Promise<ActivityDetail | null> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client
    .from("activities")
    .select(ACTIVITY_DETAIL_SELECT)
    .eq("slug", slug)
    .eq("type", type)
    .in("status", PUBLIC_ACTIVITY_STATUSES)
    .is("deleted_at", null)
    .not("published_at", "is", null)
    .is("activity_dates.deleted_at", null)
    .is("activity_speakers.deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error("No fue posible consultar el detalle de la actividad.", {
      cause: error,
    });
  }

  if (!data) return null;

  const { speaker_links: speakerLinks, ...activity } = data;
  const speakers = speakerLinks
    .filter((link) => link.speaker)
    .map((link) => ({
      ...link.speaker,
      roleLabel: link.role_label,
      sortOrder: link.sort_order,
    }))
    .sort((first, second) => first.sortOrder - second.sortOrder);

  return {
    ...activity,
    dates: activity.dates.sort((first, second) => first.sort_order - second.sort_order),
    speakers,
  };
}
