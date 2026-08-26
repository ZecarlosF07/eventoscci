"use server";

import { revalidatePath } from "next/cache";

import {
  deleteCourseContentSchema,
  lessonFormSchema,
  moduleFormSchema,
} from "@/features/courses/schemas/course-content.schema";
import type { LessonFormState, ModuleFormState } from "@/features/courses/types/course-content.types";
import { getAdminCourseContentRoute } from "@/features/courses/utils/course-routes";
import { requireAdmin } from "@/features/auth/services/admin-session";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/supabase-error";

function value(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function saveModuleAction(
  _previousState: ModuleFormState,
  formData: FormData,
): Promise<ModuleFormState> {
  await requireAdmin();
  const parsed = moduleFormSchema.safeParse({
    courseId: value(formData, "course_id"),
    description: value(formData, "description"),
    id: value(formData, "id"),
    isPublished: formData.get("is_published") === "on",
    sortOrder: Number(value(formData, "sort_order") || 0),
    title: value(formData, "title"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const client = await createServerSupabaseClient();
  const payload = {
    course_id: parsed.data.courseId,
    description: parsed.data.description || null,
    is_published: parsed.data.isPublished,
    sort_order: parsed.data.sortOrder,
    title: parsed.data.title,
  };
  const request = parsed.data.id
    ? client.from("course_modules").update(payload).eq("id", parsed.data.id)
    : client.from("course_modules").insert(payload);
  const { error } = await request;
  if (error) {
    logSupabaseError("course_module_save_failed", error, { courseId: parsed.data.courseId });
    return {
      message: getSupabaseErrorMessage(error, {
        fallback: "No se pudo guardar el módulo. Actualiza la página e inténtalo nuevamente.",
        messages: { COURSE_NOT_FOUND: "El curso ya no está disponible. Regresa al listado y vuelve a abrirlo." },
      }),
    };
  }
  revalidatePath(getAdminCourseContentRoute(parsed.data.courseId));
  return { message: "Módulo guardado correctamente.", success: true };
}

export async function saveLessonAction(
  _previousState: LessonFormState,
  formData: FormData,
): Promise<LessonFormState> {
  await requireAdmin();
  const durationValue = value(formData, "duration_seconds");
  const parsed = lessonFormSchema.safeParse({
    courseId: value(formData, "course_id"),
    description: value(formData, "description"),
    durationSeconds: durationValue ? Number(durationValue) : null,
    id: value(formData, "id"),
    isPublished: formData.get("is_published") === "on",
    isRequired: formData.get("is_required") === "on",
    moduleId: value(formData, "module_id"),
    sortOrder: Number(value(formData, "sort_order") || 0),
    title: value(formData, "title"),
    videoAssetId: value(formData, "video_asset_id"),
    videoProvider: value(formData, "video_provider"),
    videoStoragePath: value(formData, "video_storage_path"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const client = await createServerSupabaseClient();
  const payload = {
    description: parsed.data.description || null,
    duration_seconds: parsed.data.durationSeconds,
    is_published: parsed.data.isPublished,
    is_required: parsed.data.isRequired,
    module_id: parsed.data.moduleId,
    sort_order: parsed.data.sortOrder,
    title: parsed.data.title,
    video_asset_id: parsed.data.videoAssetId || null,
    video_provider: parsed.data.videoProvider,
    video_storage_path: parsed.data.videoStoragePath || null,
  };
  const request = parsed.data.id
    ? client.from("lessons").update(payload).eq("id", parsed.data.id)
    : client.from("lessons").insert(payload);
  const { error } = await request;
  if (error) {
    logSupabaseError("course_lesson_save_failed", error, { moduleId: parsed.data.moduleId });
    return {
      message: getSupabaseErrorMessage(error, {
        fallback: "No se pudo guardar la clase. Actualiza la página e inténtalo nuevamente.",
        messages: { MODULE_NOT_FOUND: "El módulo ya no está disponible. Actualiza el contenido del curso." },
      }),
    };
  }
  revalidatePath(getAdminCourseContentRoute(parsed.data.courseId));
  return { message: "Clase guardada correctamente.", success: true };
}

async function softDeleteContent(
  table: "course_modules" | "lessons",
  courseId: string,
  id: string,
): Promise<void> {
  const account = await requireAdmin();
  const parsed = deleteCourseContentSchema.parse({ courseId, id });
  const client = await createServerSupabaseClient();
  const { error } = await client.from(table).update({
    deleted_at: new Date().toISOString(),
    deleted_by: account.userId,
  }).eq("id", parsed.id);
  if (error) throw new Error("No fue posible eliminar el contenido.", { cause: error });
  revalidatePath(getAdminCourseContentRoute(parsed.courseId));
}

export async function deleteModuleAction(courseId: string, id: string): Promise<void> {
  return softDeleteContent("course_modules", courseId, id);
}

export async function deleteLessonAction(courseId: string, id: string): Promise<void> {
  return softDeleteContent("lessons", courseId, id);
}
