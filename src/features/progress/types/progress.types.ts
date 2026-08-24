import type { Tables } from "@/lib/supabase/database.types";

export type LessonProgress = Tables<"lesson_progress">;

export type LessonProgressStatus = "completed" | "in_progress" | "not_started";

export interface LessonProgressState {
  courseProgressPercent: number;
  isCompleted: boolean;
  lastPositionSeconds: number;
  progressPercent: number;
  watchedSeconds: number;
}

export interface LessonProgressUpdateInput {
  enrollmentId: string;
  lastPositionSeconds: number;
  lessonId: string;
  watchedSeconds: number;
}

export interface LessonProgressUpdateResult extends LessonProgressState {
  completedAt: string | null;
  courseCompletionReady: boolean;
  id: string;
}

export interface UseLessonProgressOptions {
  durationSeconds: number;
  enrollmentId: string;
  initialCourseProgressPercent: number;
  initialProgress?: LessonProgress | null;
  lessonId: string;
}

export interface LessonProgressController {
  isSaving: boolean;
  onEnded: () => void;
  onPause: () => void;
  onPlay: () => void;
  onTimeChange: (positionSeconds: number) => void;
  progress: LessonProgressState;
  saveError: string | null;
}

export interface PlaybackTrackerProps {
  initialPositionSeconds: number;
  onEnded: () => void;
  onPause: () => void;
  onPlay: () => void;
  onTimeChange: (positionSeconds: number) => void;
  title: string;
}

export interface CourseProgressCounts {
  completed: number;
  pending: number;
  total: number;
}

