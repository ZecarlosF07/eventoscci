"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { ROUTES } from "@/constants/routes";
import { requireActiveAccount } from "@/features/auth/services/account-guards";
import { getCampusCourseRoute } from "@/features/courses/utils/course-routes";
import { privacyInputSchema } from "@/features/privacy/schemas/privacy.schema";
import type { PrivacyFormState } from "@/features/privacy/types/privacy.types";
import { getPrivacyError } from "@/features/privacy/utils/privacy-error";
import { parsePrivacyFormData } from "@/features/privacy/utils/privacy-form-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function acceptCampusPrivacy(courseId: string, _state: PrivacyFormState, formData: FormData): Promise<PrivacyFormState> {
  await requireActiveAccount();
  if (!z.uuid().safeParse(courseId).success) return { message: "El curso no está disponible." };
  const parsed = privacyInputSchema.safeParse(parsePrivacyFormData(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const client = await createServerSupabaseClient();
  const { error } = await client.rpc("enroll_free_course_with_privacy", { p_course_id: courseId, p_privacy: parsed.data });
  if (error) return { message: getPrivacyError(error.message) ?? "No fue posible completar la matrícula. Conservamos tu elección para que puedas intentarlo de nuevo." };
  revalidatePath(ROUTES.campusCourses);
  redirect(getCampusCourseRoute(courseId));
}
