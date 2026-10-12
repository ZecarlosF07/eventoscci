"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import {
  COURSE_BANNER_BUCKET,
} from "@/features/courses/constants/course.constants";
import { courseFormSchema, courseStatusSchema } from "@/features/courses/schemas/course.schema";
import type { CourseFormState } from "@/features/courses/types/course-form.types";
import type { CourseStatus } from "@/features/courses/types/course.types";
import { parseCourseFormData } from "@/features/courses/utils/course-form-data";
import { getAdminCourseRoute } from "@/features/courses/utils/course-routes";
import { createContentSlug } from "@/features/activities/utils/slugify";
import { requireAdmin } from "@/features/auth/services/admin-session";
import { consumeStagedImage } from "@/features/media/services/consume-staged-image";
import { invalidatePublicCourseContent } from "@/features/seo/services/invalidate-public-content";
import type { Json } from "@/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseErrorMessage, logSupabaseError, matchesSupabaseError } from "@/lib/supabase/supabase-error";

export async function saveCourseAction(
  previousState: CourseFormState,
  formData: FormData,
): Promise<CourseFormState> {
  await requireAdmin();
  const input = parseCourseFormData(formData);
  const savedId = input.id || previousState.savedId;
  const parsed = courseFormSchema.safeParse(input);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors, savedId };
  const stagedBannerPath = String(formData.get("banner_staged_path") ?? "").trim();

  const courseId = parsed.data.id || crypto.randomUUID();
  const course = {
    ...parsed.data,
    id: courseId,
    slug: parsed.data.slug || createContentSlug(parsed.data.title),
  };
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("save_course", {
    p_course: course as Json,
    p_instructors: parsed.data.instructors as Json,
  });
  if (error) {
    logSupabaseError("course_save_failed", error, { courseId });
    if (error.code === "23505" && matchesSupabaseError(error, "slug")) {
      return { errors: { slug: ["Este slug ya pertenece a otro curso. Modifícalo o déjalo vacío para generarlo nuevamente."] }, savedId };
    }
    return {
      message: getSupabaseErrorMessage(error, {
        fallback: "No se pudo guardar el curso. Actualiza la página e inténtalo nuevamente.",
        messages: {
          COURSE_NOT_FOUND: "El curso ya no está disponible. Regresa al listado y vuelve a abrirlo.",
          INVALID_INSTRUCTORS: "La configuración de instructores no es válida. Revisa los instructores seleccionados.",
        },
      }),
      savedId,
    };
  }
  if (!data) return { message: "El curso no pudo confirmarse después de guardarlo. Actualiza la lista antes de volver a intentarlo.", savedId };

  if (stagedBannerPath) {
    let bannerPath: string | null = null;
    try {
      bannerPath = await consumeStagedImage(COURSE_BANNER_BUCKET, stagedBannerPath, courseId);
      const { error: updateError } = await client.from("courses")
        .update({ banner_path: bannerPath }).eq("id", courseId);
      if (updateError) {
        logSupabaseError("course_banner_link_failed", updateError, { courseId });
        throw new Error("El curso se guardó, pero la portada no pudo asociarse. Puedes volver a cargarla al editarlo.");
      }
      if (parsed.data.banner_path && parsed.data.banner_path !== bannerPath) {
        const { error: cleanupError } = await client.storage.from(COURSE_BANNER_BUCKET).remove([parsed.data.banner_path]);
        if (cleanupError) logSupabaseError("course_old_banner_cleanup_failed", cleanupError, { courseId });
      }
    } catch (uploadError) {
      if (bannerPath) await client.storage.from(COURSE_BANNER_BUCKET).remove([bannerPath]);
      // The course RPC succeeded even if its media failed; expire public data too.
      invalidatePublicCourseContent();
      revalidatePath(ROUTES.adminCourses);
      return {
        message: uploadError instanceof Error ? uploadError.message : "El curso se guardó sin portada.",
        savedId: courseId,
        success: true,
        warning: true,
      };
    }
  }

  invalidatePublicCourseContent();
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
  invalidatePublicCourseContent();
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
  invalidatePublicCourseContent();
  revalidatePath(ROUTES.adminCourses);
  redirect(ROUTES.adminCourses);
}
