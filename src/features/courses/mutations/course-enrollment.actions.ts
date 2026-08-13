"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { requireActiveAccount } from "@/features/auth/services/account-guards";
import { requireAdmin } from "@/features/auth/services/admin-session";
import {
  enrollFreeCourseSchema,
  grantCourseAccessSchema,
  revokeCourseAccessSchema,
} from "@/features/courses/schemas/course-enrollment.schema";
import { getAdminCourseStudentsRoute, getCampusCourseRoute } from "@/features/courses/utils/course-routes";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function enrollFreeCourseAction(courseId: string): Promise<void> {
  await requireActiveAccount();
  const parsed = enrollFreeCourseSchema.parse({ courseId });
  const client = await createServerSupabaseClient();
  const { error } = await client.rpc("enroll_free_course", { p_course_id: parsed.courseId });
  if (error) throw new Error("No fue posible habilitar el curso gratuito.", { cause: error });
  revalidatePath(ROUTES.campusCourses);
  redirect(getCampusCourseRoute(parsed.courseId));
}

export async function grantCourseAccessAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const priceValue = String(formData.get("price_snapshot") ?? "").trim();
  const parsed = grantCourseAccessSchema.parse({
    courseId: String(formData.get("course_id") ?? ""),
    personId: String(formData.get("person_id") ?? ""),
    priceSnapshot: priceValue ? Number(priceValue) : null,
    registrationType: String(formData.get("registration_type") ?? "general"),
  });
  const client = await createServerSupabaseClient();
  const { error } = await client.rpc("grant_course_access", {
    p_course_id: parsed.courseId,
    p_person_id: parsed.personId,
    p_price_snapshot: parsed.priceSnapshot ?? undefined,
    p_registration_type: parsed.registrationType,
  });
  if (error) throw new Error("No fue posible habilitar el curso.", { cause: error });
  revalidatePath(getAdminCourseStudentsRoute(parsed.courseId));
}

export async function revokeCourseAccessAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = revokeCourseAccessSchema.parse({
    courseId: String(formData.get("course_id") ?? ""),
    enrollmentId: String(formData.get("enrollment_id") ?? ""),
    reason: String(formData.get("reason") ?? ""),
  });
  const client = await createServerSupabaseClient();
  const { error } = await client.rpc("revoke_course_access", {
    p_enrollment_id: parsed.enrollmentId,
    p_reason: parsed.reason,
  });
  if (error) throw new Error("No fue posible revocar el acceso.", { cause: error });
  revalidatePath(getAdminCourseStudentsRoute(parsed.courseId));
}
