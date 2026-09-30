"use server";

import { updateTag } from "next/cache";
import { z } from "zod";

import {
  deliverNotificationImmediately,
  deliverNotificationImmediatelyById,
} from "@/features/notifications/services/process-notifications";
import { PUBLIC_CACHE_TAGS } from "@/features/seo/constants/public-cache.constants";
import { REGISTRATION_ERROR_MESSAGES } from "@/features/registrations/constants/registration.constants";
import {
  registrationRpcResultSchema,
} from "@/features/registrations/schemas/registration.schema";
import type {
  RegistrationInput,
  RegistrationMutationResult,
} from "@/features/registrations/types/registration.types";
import { getRegistrationErrorCode } from "@/features/registrations/utils/registration-errors";
import { validateRegistrationWithBilling } from "@/features/registrations/utils/registration-billing-validation";
import { isStudentRegistrationRestricted } from "@/features/registrations/utils/student-registration-policy";
import type { Json } from "@/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function registerActivity(
  activityId: string,
  input: RegistrationInput,
): Promise<RegistrationMutationResult> {
  if (!z.uuid().safeParse(activityId).success) return { code: "ACTIVITY_NOT_FOUND", message: REGISTRATION_ERROR_MESSAGES.ACTIVITY_NOT_FOUND, success: false };
  const client = await createServerSupabaseClient();
  const { data: activity, error: activityError } = await client.from("activities").select("allows_student_registration,is_free,general_price,member_price").eq("id", activityId).maybeSingle();
  if (activityError) return { code: "DATABASE_ERROR", message: REGISTRATION_ERROR_MESSAGES.DATABASE_ERROR, success: false };
  if (!activity) return { code: "ACTIVITY_NOT_FOUND", message: REGISTRATION_ERROR_MESSAGES.ACTIVITY_NOT_FOUND, success: false };
  if (isStudentRegistrationRestricted(activity.allows_student_registration, input.participant_profile)) {
    return { code: "STUDENT_REGISTRATION_NOT_ALLOWED", message: REGISTRATION_ERROR_MESSAGES.STUDENT_REGISTRATION_NOT_ALLOWED, success: false };
  }
  const price = activity.is_free ? 0 : input.registration_type === "member" ? activity.member_price : activity.general_price;
  const parsed = validateRegistrationWithBilling(input, price);

  if (!parsed.success) {
    return {
      code: "VALIDATION_ERROR",
      fieldErrors: Object.fromEntries(parsed.error.issues.map((issue) => [issue.path.join("."), [issue.message]])),
      message: REGISTRATION_ERROR_MESSAGES.VALIDATION_ERROR,
      success: false,
    };
  }

  const payload: Json = parsed.data;
  const { data, error } = await client.rpc("register_activity", {
    p_activity_id: activityId,
    p_registration: payload,
  });

  if (error) {
    if (error.message.includes("BILLING_REQUIRED") || error.message.includes("INVALID_BILLING_DATA")) return {
      code: "VALIDATION_ERROR", fieldErrors: { "billing.document": ["Revisa los datos para el comprobante. El precio puede haber cambiado; actualiza si no aparecen los campos."] },
      message: "Completa o revisa los datos para la boleta o factura.", success: false,
    };
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

  await deliverNotificationImmediately({
    eventType: result.data.notification_event,
    relatedEntityId: result.data.registration_id,
    relatedEntityType: "registration",
  });
  if (result.data.certificate_request_notification_id) {
    await deliverNotificationImmediatelyById(result.data.certificate_request_notification_id);
  }
  updateTag(PUBLIC_CACHE_TAGS.availability);

  return { data: result.data, success: true };
}
