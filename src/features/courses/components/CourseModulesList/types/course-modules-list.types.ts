import type {
  CourseModule,
  Lesson,
  LessonProgress,
} from "@/features/courses/types/course.types";
import type { QuizSummary } from "@/features/quizzes/types/quiz.types";

export interface CourseModulesListProps {
  courseId: string;
  lessonProgress: LessonProgress[];
  lessons: Lesson[];
  modules: CourseModule[];
  quizSummaries: QuizSummary[];
}
