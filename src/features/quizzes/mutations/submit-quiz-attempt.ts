import { quizAttemptResultSchema } from "@/features/quizzes/schemas/quiz.schema";
import type {
  QuizAnswerInput,
  QuizAttemptResult,
} from "@/features/quizzes/types/quiz.types";
import { mapQuizAttemptResult } from "@/features/quizzes/utils/quiz";
import type { Json } from "@/lib/supabase/database.types";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export async function submitQuizAttempt(
  enrollmentId: string,
  quizId: string,
  answers: QuizAnswerInput[],
): Promise<QuizAttemptResult> {
  const client = createBrowserSupabaseClient();
  const { data, error } = await client.rpc("submit_quiz_attempt", {
    p_answers: answers.map((answer) => ({
      question_id: answer.questionId,
      selected_option_id: answer.selectedOptionId,
    })) as Json,
    p_enrollment_id: enrollmentId,
    p_quiz_id: quizId,
  });
  if (error) throw new Error("No fue posible entregar la evaluación.", { cause: error });
  const parsed = quizAttemptResultSchema.safeParse(data);
  if (!parsed.success) throw new Error("Supabase devolvió un resultado inválido.");
  return mapQuizAttemptResult(parsed.data);
}
