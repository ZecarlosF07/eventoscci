import "server-only";

import type { ActivityDetail } from "@/features/activities/types/activity.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const ADMIN_ACTIVITY_DETAIL_SELECT = `
  *,
  category:categories!activities_category_id_fkey(id, name, slug),
  contact:activity_contacts!activities_contact_id_fkey(id, label, contact_name, whatsapp_phone, email),
  venue:venues!activities_venue_id_fkey(id, name, address, reference, maps_embed_url),
  dates:activity_dates(*),
  speaker_links:activity_speakers(
    role_label, sort_order, deleted_at,
    speaker:speakers!activity_speakers_speaker_id_fkey(
      id, first_names, last_names, professional_title, organization, bio, photo_path,
      linkedin_url, website_url, specialties
    )
  )
`;

export async function getAdminActivityById(
  id: string,
): Promise<ActivityDetail | null> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client
    .from("activities")
    .select(ADMIN_ACTIVITY_DETAIL_SELECT)
    .eq("id", id)
    .is("deleted_at", null)
    .is("activity_dates.deleted_at", null)
    .is("activity_speakers.deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error("No fue posible cargar la actividad.", { cause: error });
  }
  if (!data) return null;

  const { speaker_links: speakerLinks, ...activity } = data;
  return {
    ...activity,
    dates: activity.dates.sort((first, second) => first.sort_order - second.sort_order),
    speakers: speakerLinks
      .filter((link) => link.speaker && !link.deleted_at)
      .map((link) => ({
        ...link.speaker,
        roleLabel: link.role_label,
        sortOrder: link.sort_order,
      }))
      .sort((first, second) => first.sortOrder - second.sortOrder),
  };
}
