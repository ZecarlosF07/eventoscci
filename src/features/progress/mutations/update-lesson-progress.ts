import { lessonProgressResultSchema } from "@/features/progress/schemas/lesson-progress.schema";
import type {
  LessonProgressUpdateInput,
  LessonProgressUpdateResult,
} from "@/features/progress/types/progress.types";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export async function updateLessonProgress(
  input: LessonProgressUpdateInput,
): Promise<LessonProgressUpdateResult> {
  const client = createBrowserSupabaseClient();
  const { data, error } = await client.rpc("update_lesson_progress", {
    p_enrollment_id: input.enrollmentId,
    p_last_position_seconds: input.lastPositionSeconds,
    p_lesson_id: input.lessonId,
    p_watched_seconds: input.watchedSeconds,
  });

  if (error) {
    throw new Error("No fue posible guardar el avance de la clase.", { cause: error });
  }

  const parsed = lessonProgressResultSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Supabase devolvió un progreso de clase inválido.");
  }

  return {
    completedAt: parsed.data.completed_at,
    courseCompletionReady: parsed.data.course_completion_ready,
    courseProgressPercent: parsed.data.course_progress_percent,
    id: parsed.data.id,
    isCompleted: parsed.data.is_completed,
    lastPositionSeconds: parsed.data.last_position_seconds,
    progressPercent: parsed.data.progress_percent,
    watchedSeconds: parsed.data.watched_seconds,
  };
}

