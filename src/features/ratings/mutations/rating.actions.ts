"use server";

import { revalidatePath } from "next/cache";

import { requireActiveAccount } from "@/features/auth/services/account-guards";
import { courseRatingFormSchema } from "@/features/ratings/schemas/rating.schema";
import type { CourseRatingFormState } from "@/features/ratings/types/rating.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/supabase-error";

export async function saveCourseRatingAction(
  _previousState: CourseRatingFormState,
  formData: FormData,
): Promise<CourseRatingFormState> {
  await requireActiveAccount();
  const parsed = courseRatingFormSchema.safeParse({
    comment: String(formData.get("comment") ?? ""),
    courseId: String(formData.get("course_id") ?? ""),
    rating: Number(formData.get("rating")),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const client = await createServerSupabaseClient();
  const { error } = await client.rpc("save_course_rating", {
    p_comment: parsed.data.comment || undefined,
    p_course_id: parsed.data.courseId,
    p_rating: parsed.data.rating,
  });
  if (error) {
    logSupabaseError("course_rating_save_failed", error, { courseId: parsed.data.courseId });
    return {
      message: getSupabaseErrorMessage(error, {
        fallback: "No se pudo guardar tu valoración. Revisa tu conexión e inténtalo nuevamente.",
        messages: {
          ACCOUNT_NOT_LINKED: "Tu cuenta no está vinculada a una ficha institucional. Comunícate con la Cámara.",
          COURSE_NOT_COMPLETED: "Solo puedes valorar el curso después de completarlo.",
          VALIDATION_ERROR: "La valoración debe estar entre 1 y 5 y el comentario no puede superar 2000 caracteres.",
        },
      }),
    };
  }
  revalidatePath(`/campus/cursos/${parsed.data.courseId}`);
  return { message: "Valoración guardada.", success: true };
}

export async function deleteCourseRatingAction(courseId: string): Promise<void> {
  await requireActiveAccount();
  const parsed = courseRatingFormSchema.shape.courseId.parse(courseId);
  const client = await createServerSupabaseClient();
  const { error } = await client.rpc("delete_course_rating", { p_course_id: parsed });
  if (error) throw new Error("No fue posible retirar la valoración.", { cause: error });
  revalidatePath(`/campus/cursos/${parsed}`);
}
