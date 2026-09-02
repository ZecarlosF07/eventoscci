import type { CourseModule, Lesson, StudentCourseContent } from "@/features/courses/types/course.types";
import type { LessonProgress, LessonProgressUpdateResult } from "@/features/progress/types/progress.types";
import type { QuizSummary } from "@/features/quizzes/types/quiz.types";
import type { QuizAttemptResult } from "@/features/quizzes/types/quiz.types";

export type CourseLearningSelection =
  | { kind: "lesson"; lessonId: string }
  | { kind: "quiz"; moduleId: string };

export type CourseLearningPanel = "curriculum" | "resources";

export interface CourseLearningSelectionInput {
  lessons: Pick<Lesson, "id" | "is_required" | "module_id" | "sort_order">[];
  modules: Pick<CourseModule, "id" | "sort_order">[];
  progress: Pick<LessonProgress, "is_completed" | "lesson_id">[];
  quizzes: Pick<QuizSummary, "isPassed" | "moduleId">[];
  requestedLessonId?: string;
  requestedQuizModuleId?: string;
}

export interface CourseLearningWorkspaceProps {
  content: StudentCourseContent;
  initialPanel?: CourseLearningPanel;
  requestedLessonId?: string;
  requestedQuizModuleId?: string;
}

export interface CourseLearningStageProps {
  content: StudentCourseContent;
  onProgressChange: (lessonId: string, result: LessonProgressUpdateResult) => void;
  onQuizAttempt: (moduleId: string, result: QuizAttemptResult) => void;
  progress: LessonProgress[];
  selection: CourseLearningSelection | null;
}

export interface CourseLearningSidebarProps {
  activePanel: CourseLearningPanel;
  content: StudentCourseContent;
  onPanelChange: (panel: CourseLearningPanel) => void;
  onSelect: (selection: CourseLearningSelection) => void;
  progress: LessonProgress[];
  quizSummaries: QuizSummary[];
  selection: CourseLearningSelection | null;
}

export interface CourseModuleAccordionProps {
  index: number;
  initiallyOpen: boolean;
  lessons: Lesson[];
  module: CourseModule;
  onSelect: (selection: CourseLearningSelection) => void;
  progress: LessonProgress[];
  quiz?: QuizSummary;
  selection: CourseLearningSelection | null;
}
