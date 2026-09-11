import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";

import { PUBLIC_ACTIVITY_STATUSES } from "@/features/activities/constants/activity.constants";
import type {
  ActivityDetail,
  ActivityType,
} from "@/features/activities/types/activity.types";
import {
  PUBLIC_CACHE_REVALIDATE_SECONDS,
  PUBLIC_CACHE_TAGS,
} from "@/features/seo/constants/public-cache.constants";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

const ACTIVITY_DETAIL_SELECT = `
  academic_hours, additional_info, address, banner_path, capacity, category_id,
  certificate_general_price, certificate_member_price, certificate_mode,
  contact_email, contact_id, contact_name, contact_phone, created_at, created_by,
  deleted_at, deleted_by, description, duration_text, general_price, id, is_free,
  location_name, maps_embed_url, member_price, members_only, modality, objective,
  program, program_image_paths, published_at, registration_close_at,
  registration_open_at, registrations_closed_manually, short_description, slug,
  status, syllabus, target_audience, title, type, updated_at, updated_by, venue_id,
  category:categories!activities_category_id_fkey(id, name, slug),
  contact:activity_contacts!activities_contact_id_fkey(id, label, contact_name, whatsapp_phone, email),
  venue:venues!activities_venue_id_fkey(id, name, address, reference, maps_embed_url),
  dates:activity_dates(*),
  speaker_links:activity_speakers(
    role_label, sort_order,
    speaker:speakers!activity_speakers_speaker_id_fkey(
      id, first_names, last_names, professional_title, organization, bio, photo_path,
      linkedin_url, website_url, specialties
    )
  )
`;

const getCachedPublicActivityBySlug = unstable_cache(async function getCachedPublicActivityBySlug(
  type: ActivityType,
  slug: string,
): Promise<ActivityDetail | null> {
  const client = createPublicSupabaseClient();
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
}, ["public-activity-detail"], {
  revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
  tags: [PUBLIC_CACHE_TAGS.activities],
});

export const getPublicActivityBySlug = cache(
  (type: ActivityType, slug: string) => getCachedPublicActivityBySlug(type, slug),
);
