import { notFound } from "next/navigation";

import { getAdminCourseContent } from "@/features/courses/queries/get-course-by-id";
import { QuizEditor } from "@/features/quizzes/components/QuizEditor";
import { getAdminQuiz } from "@/features/quizzes/queries/get-quizzes";
import type { AdminQuizPageProps } from "@/features/quizzes/types/quiz.types";

export default async function AdminQuizPage({ params }: AdminQuizPageProps) {
  const { id, moduleId } = await params;
  const course = await getAdminCourseContent(id);
  if (!course) notFound();
  const courseModule = course.modules.find((module) => module.id === moduleId);
  if (!courseModule) notFound();
  const quiz = await getAdminQuiz(moduleId);
  return (
    <QuizEditor
      courseId={id}
      initialQuiz={quiz}
      moduleId={moduleId}
      moduleTitle={courseModule.title}
    />
  );
}
