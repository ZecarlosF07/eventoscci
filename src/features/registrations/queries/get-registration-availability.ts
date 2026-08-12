import "server-only";

import { registrationAvailabilitySchema } from "@/features/registrations/schemas/registration.schema";
import type { RegistrationAvailability } from "@/features/registrations/types/registration.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getRegistrationAvailability(
  activityId: string,
): Promise<RegistrationAvailability | null> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("get_activity_registration_availability", {
    p_activity_id: activityId,
  });

  if (error) {
    throw new Error("No fue posible consultar la disponibilidad.", { cause: error });
  }

  const result = registrationAvailabilitySchema.safeParse(data);
  return result.success ? result.data : null;
}
