import type { Lesson } from "@/features/courses/types/course.types";
import type { LessonProgress } from "@/features/progress/types/progress.types";
import type { LessonProgressUpdateResult } from "@/features/progress/types/progress.types";

export interface LessonPlayerProps {
  enrollmentId: string;
  initialCourseProgressPercent: number;
  initialProgress?: LessonProgress | null;
  lesson: Lesson;
  onProgressChange?: (result: LessonProgressUpdateResult) => void;
  signedStorageUrl?: string;
}

export interface TrackedLessonPlayerProps extends LessonPlayerProps {
  durationSeconds: number;
}
