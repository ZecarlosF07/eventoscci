import type {
  CourseLearningSelection,
  CourseLearningSelectionInput,
} from "@/features/courses/types/course-learning.types";
import type { LessonProgress, LessonProgressUpdateResult } from "@/features/progress/types/progress.types";

export function mergeLessonProgress(
  current: LessonProgress[],
  enrollmentId: string,
  lessonId: string,
  durationSeconds: number | null,
  result: LessonProgressUpdateResult,
): LessonProgress[] {
  const now = new Date().toISOString();
  const existing = current.find((item) => item.lesson_id === lessonId);
  const next: LessonProgress = {
    completed_at: result.completedAt,
    created_at: existing?.created_at ?? now,
    deleted_at: null,
    deleted_by: null,
    duration_seconds_snapshot: existing?.duration_seconds_snapshot ?? durationSeconds,
    enrollment_id: enrollmentId,
    id: result.id,
    is_completed: result.isCompleted,
    last_position_seconds: result.lastPositionSeconds,
    last_watched_at: now,
    lesson_id: lessonId,
    progress_percent: result.progressPercent,
    updated_at: now,
    watched_seconds: result.watchedSeconds,
  };
  return existing
    ? current.map((item) => item.lesson_id === lessonId ? next : item)
    : [...current, next];
}

export function getInitialLearningSelection(
  input: CourseLearningSelectionInput,
): CourseLearningSelection | null {
  if (input.requestedLessonId && input.lessons.some((lesson) => lesson.id === input.requestedLessonId)) {
    return { kind: "lesson", lessonId: input.requestedLessonId };
  }
  if (input.requestedQuizModuleId && input.quizzes.some((quiz) => quiz.moduleId === input.requestedQuizModuleId)) {
    return { kind: "quiz", moduleId: input.requestedQuizModuleId };
  }
  const moduleOrder = new Map(input.modules.map((module) => [module.id, module.sort_order]));
  const orderedLessons = [...input.lessons].sort((first, second) =>
    (moduleOrder.get(first.module_id) ?? 0) - (moduleOrder.get(second.module_id) ?? 0)
    || first.sort_order - second.sort_order,
  );
  const completedIds = new Set(input.progress.filter((item) => item.is_completed).map((item) => item.lesson_id));
  const pendingLesson = orderedLessons.find((lesson) => lesson.is_required && !completedIds.has(lesson.id));
  if (pendingLesson) return { kind: "lesson", lessonId: pendingLesson.id };
  const quizByModule = new Map(input.quizzes.map((quiz) => [quiz.moduleId, quiz]));
  const pendingQuizModule = [...input.modules]
    .sort((first, second) => first.sort_order - second.sort_order)
    .find((module) => quizByModule.has(module.id) && !quizByModule.get(module.id)?.isPassed);
  if (pendingQuizModule) return { kind: "quiz", moduleId: pendingQuizModule.id };
  return orderedLessons[0] ? { kind: "lesson", lessonId: orderedLessons[0].id } : null;
}

export function getCourseLearningUrl(
  courseId: string,
  selection: CourseLearningSelection | null,
  panel?: "curriculum" | "resources",
): string {
  const params = new URLSearchParams();
  if (selection?.kind === "lesson") params.set("clase", selection.lessonId);
  if (selection?.kind === "quiz") params.set("quiz", selection.moduleId);
  if (panel === "resources") params.set("panel", "recursos");
  const query = params.toString();
  return `/campus/cursos/${courseId}${query ? `?${query}` : ""}`;
}
