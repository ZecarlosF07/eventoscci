import { REGISTRATION_ERROR_MESSAGES } from "@/features/registrations/constants/registration.constants";
import {
  registrationFormSchema,
  registrationRpcResultSchema,
} from "@/features/registrations/schemas/registration.schema";
import type {
  RegistrationInput,
  RegistrationMutationResult,
} from "@/features/registrations/types/registration.types";
import { getRegistrationErrorCode } from "@/features/registrations/utils/registration-errors";
import type { Json } from "@/lib/supabase/database.types";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export async function registerActivity(
  activityId: string,
  input: RegistrationInput,
): Promise<RegistrationMutationResult> {
  const parsed = registrationFormSchema.safeParse(input);

  if (!parsed.success) {
    return {
      code: "VALIDATION_ERROR",
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: REGISTRATION_ERROR_MESSAGES.VALIDATION_ERROR,
      success: false,
    };
  }

  const client = createBrowserSupabaseClient();
  const payload: Json = parsed.data;
  const { data, error } = await client.rpc("register_activity", {
    p_activity_id: activityId,
    p_registration: payload,
  });

  if (error) {
    const code = getRegistrationErrorCode(error.message);
    return {
      code,
      message: REGISTRATION_ERROR_MESSAGES[code],
      success: false,
    };
  }

  const result = registrationRpcResultSchema.safeParse(data);
  if (!result.success) {
    return {
      code: "DATABASE_ERROR",
      message: REGISTRATION_ERROR_MESSAGES.DATABASE_ERROR,
      success: false,
    };
  }

  return { data: result.data, success: true };
}
