import "server-only";

import type { LessonProgress } from "@/features/progress/types/progress.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getCourseLessonProgress(
  enrollmentId: string,
): Promise<LessonProgress[]> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client
    .from("lesson_progress")
    .select("*")
    .eq("enrollment_id", enrollmentId)
    .is("deleted_at", null);
  if (error) throw new Error("No fue posible cargar el avance de las clases.", { cause: error });
  return data ?? [];
}

export async function getLessonProgress(
  enrollmentId: string,
  lessonId: string,
): Promise<LessonProgress | null> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client
    .from("lesson_progress")
    .select("*")
    .eq("enrollment_id", enrollmentId)
    .eq("lesson_id", lessonId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw new Error("No fue posible cargar el avance de la clase.", { cause: error });
  return data;
}

