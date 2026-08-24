import { LESSON_COMPLETION_PERCENT } from "@/features/progress/constants/progress.constants";
import type {
  CourseProgressCounts,
  LessonProgress,
  LessonProgressStatus,
} from "@/features/progress/types/progress.types";
import type { Lesson } from "@/features/courses/types/course.types";

export function clampVideoPosition(position: number, duration: number): number {
  if (!Number.isFinite(position) || !Number.isFinite(duration) || duration <= 0) return 0;
  return Math.min(Math.max(Math.floor(position), 0), Math.floor(duration));
}

export function getLessonProgressStatus(
  progressPercent: number,
  isCompleted: boolean,
): LessonProgressStatus {
  if (isCompleted || progressPercent >= LESSON_COMPLETION_PERCENT) return "completed";
  return progressPercent > 0 ? "in_progress" : "not_started";
}

export function getLessonProgressMap(
  progress: LessonProgress[],
): Map<string, LessonProgress> {
  return new Map(progress.map((item) => [item.lesson_id, item]));
}

export function getCourseProgressCounts(
  lessons: Lesson[],
  progress: LessonProgress[],
): CourseProgressCounts {
  const progressByLesson = getLessonProgressMap(progress);
  const requiredLessons = lessons.filter((lesson) => lesson.is_required);
  const completed = requiredLessons.filter(
    (lesson) => progressByLesson.get(lesson.id)?.is_completed,
  ).length;
  return {
    completed,
    pending: requiredLessons.length - completed,
    total: requiredLessons.length,
  };
}

