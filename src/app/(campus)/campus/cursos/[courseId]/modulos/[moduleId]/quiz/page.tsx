import { notFound } from "next/navigation";

import { Badge } from "@/components/atoms/Badge";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import { CoursePlayerTemplate } from "@/components/templates/CoursePlayerTemplate";
import { getStudentCourseContent } from "@/features/courses/queries/get-my-courses";
import type { StudentQuizPageProps } from "@/features/courses/types/course-page.types";
import { StudentQuizForm } from "@/features/quizzes/components/StudentQuizForm";
import { getQuizAttempts, getStudentQuiz } from "@/features/quizzes/queries/get-quizzes";

export default async function StudentQuizPage({ params }: StudentQuizPageProps) {
  const { courseId, moduleId } = await params;
  const content = await getStudentCourseContent(courseId);
  if (!content || !content.modules.some((module) => module.id === moduleId)) notFound();
  const quiz = await getStudentQuiz(courseId, moduleId);
  if (!quiz) notFound();
  const attempts = await getQuizAttempts(quiz.enrollmentId, quiz.id);

  return (
    <CoursePlayerTemplate content={content} section="content">
      <div className="space-y-7">
        <header>
          <div className="flex flex-wrap items-center gap-3">
            <Heading level={1}>{quiz.title}</Heading>
            <Badge>Nota mínima: {quiz.passingScore} %</Badge>
          </div>
          {quiz.description ? <Text className="mt-3 whitespace-pre-line">{quiz.description}</Text> : null}
          <Text className="mt-2" size="sm">Responde todas las preguntas. La corrección se realiza al enviar.</Text>
        </header>
        <StudentQuizForm initialAttempts={attempts} quiz={quiz} />
      </div>
    </CoursePlayerTemplate>
  );
}
