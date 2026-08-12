import "server-only";

import { publicRegistrationResultSchema } from "@/features/registrations/schemas/registration.schema";
import type { PublicRegistrationResult } from "@/features/registrations/types/registration.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getRegistrationResult(
  registrationCode: string,
): Promise<PublicRegistrationResult | null> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("get_public_registration_result", {
    p_registration_code: registrationCode,
  });

  if (error) {
    throw new Error("No fue posible consultar el resultado de la inscripción.", {
      cause: error,
    });
  }

  const result = publicRegistrationResultSchema.safeParse(data);
  return result.success ? result.data : null;
}
