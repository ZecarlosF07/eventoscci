import {
  quizAttemptSchema,
  studentQuizSchema,
} from "@/features/quizzes/schemas/quiz.schema";
import type { QuizAttempt, StudentQuiz } from "@/features/quizzes/types/quiz.types";
import { mapQuizAttempt } from "@/features/quizzes/utils/quiz";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export async function loadStudentQuiz(
  courseId: string,
  moduleId: string,
): Promise<{ attempts: QuizAttempt[]; quiz: StudentQuiz }> {
  const client = createBrowserSupabaseClient();
  const { data, error } = await client.rpc("get_student_quiz", {
    p_course_id: courseId,
    p_module_id: moduleId,
  });
  if (error) throw new Error("No fue posible cargar la evaluación.", { cause: error });
  const parsed = studentQuizSchema.safeParse(data);
  if (!parsed.success) throw new Error("La evaluación no está disponible.");
  const quiz: StudentQuiz = {
    description: parsed.data.description,
    enrollmentId: parsed.data.enrollment_id,
    id: parsed.data.id,
    moduleId: parsed.data.module_id,
    passingScore: parsed.data.passing_score,
    questions: parsed.data.questions.map((question) => ({
      id: question.id,
      options: question.options.map((option) => ({
        id: option.id,
        optionText: option.option_text,
        sortOrder: option.sort_order,
      })),
      prompt: question.prompt,
      sortOrder: question.sort_order,
    })),
    title: parsed.data.title,
  };
  const { data: attemptsData, error: attemptsError } = await client.rpc("get_quiz_attempts", {
    p_enrollment_id: quiz.enrollmentId,
    p_quiz_id: quiz.id,
  });
  if (attemptsError) throw new Error("No fue posible cargar los intentos.", { cause: attemptsError });
  const attempts = quizAttemptSchema.array().safeParse(attemptsData);
  if (!attempts.success) throw new Error("Supabase devolvió intentos inválidos.");
  return { attempts: attempts.data.map(mapQuizAttempt), quiz };
}
