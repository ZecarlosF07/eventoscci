import { quizAttemptResultSchema } from "@/features/quizzes/schemas/quiz.schema";
import type {
  QuizAnswerInput,
  QuizAttemptResult,
} from "@/features/quizzes/types/quiz.types";
import { mapQuizAttemptResult } from "@/features/quizzes/utils/quiz";
import type { Json } from "@/lib/supabase/database.types";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

function attemptErrorMessage(message: string): string {
  if (message.includes("ENROLLMENT_NOT_FOUND")) return "No encontramos tu matrícula. Regresa a Mis cursos y vuelve a abrir el curso.";
  if (message.includes("ENROLLMENT_NOT_ACTIVE")) return "Tu matrícula ya no está activa. Comunícate con la Cámara para revisar tu acceso.";
  if (message.includes("QUIZ_NOT_AVAILABLE")) return "Esta evaluación ya no está disponible. Actualiza la página para ver el contenido vigente.";
  if (message.includes("QUIZ_ENROLLMENT_MISMATCH")) return "Esta evaluación no pertenece al curso en el que estás matriculado.";
  if (message.includes("QUIZ_HAS_NO_QUESTIONS")) return "La evaluación todavía no tiene preguntas publicadas.";
  if (message.toUpperCase().includes("FETCH") || message.toUpperCase().includes("NETWORK")) {
    return "No fue posible conectar con el servicio. Revisa tu conexión; tus respuestas siguen seleccionadas.";
  }
  return "No fue posible entregar la evaluación. Tus respuestas siguen seleccionadas; inténtalo nuevamente.";
}

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
  if (error) throw new Error(attemptErrorMessage(`${error.code ?? ""} ${error.message}`), { cause: error });
  const parsed = quizAttemptResultSchema.safeParse(data);
  if (!parsed.success) throw new Error("Supabase devolvió un resultado inválido.");
  return mapQuizAttemptResult(parsed.data);
}
