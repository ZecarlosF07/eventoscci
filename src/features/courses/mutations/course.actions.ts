"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import {
  COURSE_BANNER_BUCKET,
  MAX_COURSE_BANNER_SIZE,
} from "@/features/courses/constants/course.constants";
import { courseFormSchema, courseStatusSchema } from "@/features/courses/schemas/course.schema";
import type { CourseFormState } from "@/features/courses/types/course-form.types";
import type { CourseStatus } from "@/features/courses/types/course.types";
import { parseCourseFormData } from "@/features/courses/utils/course-form-data";
import { getAdminCourseRoute } from "@/features/courses/utils/course-routes";
import { slugify } from "@/features/activities/utils/slugify";
import { requireAdmin } from "@/features/auth/services/admin-session";
import type { Json } from "@/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const BANNER_TYPES = ["image/jpeg", "image/png", "image/webp"];

function validateBanner(file: File): string | null {
  if (!file.size) return null;
  if (!BANNER_TYPES.includes(file.type)) return "Usa una imagen JPG, PNG o WebP.";
  if (file.size > MAX_COURSE_BANNER_SIZE) return "La portada no debe superar 5 MB.";
  return null;
}

async function uploadBanner(file: File, courseId: string): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${courseId}/${crypto.randomUUID()}.${extension}`;
  const client = await createServerSupabaseClient();
  const { error } = await client.storage.from(COURSE_BANNER_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error("El curso se guardó, pero la portada no pudo cargarse.");
  return path;
}

export async function saveCourseAction(
  _previousState: CourseFormState,
  formData: FormData,
): Promise<CourseFormState> {
  await requireAdmin();
  const input = parseCourseFormData(formData);
  const parsed = courseFormSchema.safeParse(input);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const banner = formData.get("banner");
  if (banner instanceof File) {
    const bannerError = validateBanner(banner);
    if (bannerError) return { errors: { banner: [bannerError] } };
  }

  const courseId = parsed.data.id || crypto.randomUUID();
  const course = {
    ...parsed.data,
    id: courseId,
    slug: parsed.data.slug || slugify(parsed.data.title),
  };
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("save_course", {
    p_course: course as Json,
    p_instructors: parsed.data.instructors as Json,
  });
  if (error || !data) return { message: "No fue posible guardar el curso." };

  if (banner instanceof File && banner.size) {
    try {
      const bannerPath = await uploadBanner(banner, courseId);
      const { error: updateError } = await client.from("courses")
        .update({ banner_path: bannerPath }).eq("id", courseId);
      if (updateError) throw updateError;
    } catch (uploadError) {
      return {
        message: uploadError instanceof Error ? uploadError.message : "El curso se guardó sin portada.",
        success: true,
      };
    }
  }

  revalidatePath(ROUTES.courses);
  revalidatePath(ROUTES.adminCourses);
  redirect(`${getAdminCourseRoute(courseId)}?guardado=1`);
}

export async function changeCourseStatusAction(courseId: string, status: CourseStatus): Promise<void> {
  await requireAdmin();
  const parsed = courseStatusSchema.parse({ courseId, status });
  const client = await createServerSupabaseClient();
  const { error } = await client.rpc("set_course_status", {
    p_course_id: parsed.courseId,
    p_status: parsed.status,
  });
  if (error) throw new Error("No fue posible cambiar el estado del curso.", { cause: error });
  revalidatePath(ROUTES.courses);
  revalidatePath(ROUTES.adminCourses);
  revalidatePath(getAdminCourseRoute(courseId));
}

export async function deleteCourseAction(courseId: string): Promise<void> {
  const account = await requireAdmin();
  const client = await createServerSupabaseClient();
  const { error } = await client.from("courses").update({
    deleted_at: new Date().toISOString(),
    deleted_by: account.userId,
    updated_by: account.userId,
  }).eq("id", courseId).is("deleted_at", null);
  if (error) throw new Error("No fue posible eliminar el curso.", { cause: error });
  revalidatePath(ROUTES.courses);
  revalidatePath(ROUTES.adminCourses);
  redirect(ROUTES.adminCourses);
}
