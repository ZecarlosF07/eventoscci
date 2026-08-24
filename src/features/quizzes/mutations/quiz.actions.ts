"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/features/auth/services/admin-session";
import { quizSaveFormSchema } from "@/features/quizzes/schemas/quiz.schema";
import type { QuizSaveState } from "@/features/quizzes/types/quiz.types";
import type { Json } from "@/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function value(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function saveQuizAction(
  _previousState: QuizSaveState,
  formData: FormData,
): Promise<QuizSaveState> {
  await requireAdmin();
  let questions: unknown;
  try {
    questions = JSON.parse(value(formData, "questions"));
  } catch {
    return { message: "La estructura de preguntas no es válida." };
  }
  const parsed = quizSaveFormSchema.safeParse({
    courseId: value(formData, "course_id"),
    description: value(formData, "description"),
    id: value(formData, "id"),
    isPublished: formData.get("is_published") === "on",
    moduleId: value(formData, "module_id"),
    questions,
    title: value(formData, "title"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const client = await createServerSupabaseClient();
  const questionPayload = parsed.data.questions.map((question, questionIndex) => ({
    explanation: question.explanation || null,
    options: question.options.map((option, optionIndex) => ({
      is_correct: option.isCorrect,
      option_text: option.optionText,
      sort_order: optionIndex,
    })),
    prompt: question.prompt,
    sort_order: questionIndex,
  }));
  const { data, error } = await client.rpc("save_quiz", {
    p_questions: questionPayload as Json,
    p_quiz: {
      description: parsed.data.description || null,
      id: parsed.data.id || null,
      is_published: parsed.data.isPublished,
      module_id: parsed.data.moduleId,
      title: parsed.data.title,
    },
  });
  if (error) return { message: "No fue posible guardar el quiz. Revisa las preguntas y alternativas." };

  revalidatePath(`/admin/cursos/${parsed.data.courseId}/contenido`);
  revalidatePath(`/admin/cursos/${parsed.data.courseId}/modulos/${parsed.data.moduleId}/quiz`);
  return { message: "Quiz guardado correctamente.", quizId: data, success: true };
}
