import "server-only";

import { unstable_cache } from "next/cache";

import {
  PUBLIC_AVAILABILITY_REVALIDATE_SECONDS,
  PUBLIC_CACHE_TAGS,
} from "@/features/seo/constants/public-cache.constants";
import { registrationAvailabilitySchema } from "@/features/registrations/schemas/registration.schema";
import type { RegistrationAvailability } from "@/features/registrations/types/registration.types";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

const getCachedRegistrationAvailability = unstable_cache(async function getCachedRegistrationAvailability(
  activityId: string,
): Promise<RegistrationAvailability | null> {
  const client = createPublicSupabaseClient();
  const { data, error } = await client.rpc("get_activity_registration_availability", {
    p_activity_id: activityId,
  });

  if (error) {
    throw new Error("No fue posible consultar la disponibilidad.", { cause: error });
  }

  const result = registrationAvailabilitySchema.safeParse(data);
  return result.success ? result.data : null;
}, ["public-registration-availability"], {
  revalidate: PUBLIC_AVAILABILITY_REVALIDATE_SECONDS,
  tags: [PUBLIC_CACHE_TAGS.availability],
});

export function getRegistrationAvailability(activityId: string) {
  return getCachedRegistrationAvailability(activityId);
}
