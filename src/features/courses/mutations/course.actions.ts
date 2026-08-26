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
import { getSupabaseErrorMessage, logSupabaseError, matchesSupabaseError } from "@/lib/supabase/supabase-error";

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
  if (error) {
    logSupabaseError("course_banner_upload_failed", error, { courseId });
    throw new Error(getSupabaseErrorMessage(error, {
      fallback: "El curso se guardó, pero la portada no pudo cargarse. Puedes volver a intentarlo al editarlo.",
      messages: {
        "BUCKET NOT FOUND": "El curso se guardó, pero el almacenamiento de portadas no está disponible. Comunícate con el administrador.",
        "MIME TYPE": "El curso se guardó, pero el formato de la portada no está permitido. Usa JPG, PNG o WebP.",
        "PAYLOAD TOO LARGE": "El curso se guardó, pero la portada supera el tamaño permitido de 5 MB.",
      },
    }));
  }
  return path;
}

export async function saveCourseAction(
  previousState: CourseFormState,
  formData: FormData,
): Promise<CourseFormState> {
  await requireAdmin();
  const input = parseCourseFormData(formData);
  const savedId = input.id || previousState.savedId;
  const parsed = courseFormSchema.safeParse(input);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors, savedId };
  const banner = formData.get("banner");
  if (banner instanceof File) {
    const bannerError = validateBanner(banner);
    if (bannerError) return { errors: { banner: [bannerError] }, savedId };
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

  if (banner instanceof File && banner.size) {
    try {
      const bannerPath = await uploadBanner(banner, courseId);
      const { error: updateError } = await client.from("courses")
        .update({ banner_path: bannerPath }).eq("id", courseId);
      if (updateError) {
        logSupabaseError("course_banner_link_failed", updateError, { courseId });
        throw new Error("El curso se guardó, pero la portada no pudo asociarse. Puedes volver a cargarla al editarlo.");
      }
    } catch (uploadError) {
      return {
        message: uploadError instanceof Error ? uploadError.message : "El curso se guardó sin portada.",
        savedId: courseId,
        success: true,
        warning: true,
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
