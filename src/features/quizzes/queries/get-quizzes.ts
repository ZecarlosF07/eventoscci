import "server-only";

import {
  adminQuizSchema,
  quizAttemptResultSchema,
  quizAttemptSchema,
  quizSummarySchema,
  studentQuizSchema,
} from "@/features/quizzes/schemas/quiz.schema";
import type {
  AdminQuiz,
  QuizAttempt,
  QuizAttemptResult,
  QuizSummary,
  StudentQuiz,
} from "@/features/quizzes/types/quiz.types";
import { mapQuizAttempt, mapQuizAttemptResult } from "@/features/quizzes/utils/quiz";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getAdminQuiz(moduleId: string): Promise<AdminQuiz | null> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("get_admin_quiz", { p_module_id: moduleId });
  if (error) throw new Error("No fue posible cargar el quiz.", { cause: error });
  if (!data) return null;
  const parsed = adminQuizSchema.safeParse(data);
  if (!parsed.success) throw new Error("Supabase devolvió un quiz administrativo inválido.");
  return {
    description: parsed.data.description,
    id: parsed.data.id,
    isPublished: parsed.data.is_published,
    moduleId: parsed.data.module_id,
    passingScore: parsed.data.passing_score,
    questions: parsed.data.questions.map((question) => ({
      explanation: question.explanation ?? "",
      id: question.id,
      options: question.options.map((option) => ({
        id: option.id,
        isCorrect: option.is_correct,
        optionText: option.option_text,
      })),
      prompt: question.prompt,
    })),
    title: parsed.data.title,
  };
}

export async function getStudentCourseQuizSummaries(courseId: string): Promise<QuizSummary[]> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("get_student_course_quiz_summaries", { p_course_id: courseId });
  if (error) throw new Error("No fue posible cargar el avance de evaluaciones.", { cause: error });
  const parsed = quizSummarySchema.array().safeParse(data);
  if (!parsed.success) throw new Error("Supabase devolvió un resumen de quizzes inválido.");
  return parsed.data.map((quiz) => ({
    attemptCount: quiz.attempt_count,
    bestScore: quiz.best_score,
    id: quiz.id,
    isPassed: quiz.is_passed,
    moduleId: quiz.module_id,
    passingScore: quiz.passing_score,
    title: quiz.title,
  }));
}

export async function getStudentQuiz(courseId: string, moduleId: string): Promise<StudentQuiz | null> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("get_student_quiz", {
    p_course_id: courseId,
    p_module_id: moduleId,
  });
  if (error) throw new Error("No fue posible cargar la evaluación.", { cause: error });
  if (!data) return null;
  const parsed = studentQuizSchema.safeParse(data);
  if (!parsed.success) throw new Error("Supabase devolvió una evaluación inválida.");
  return {
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
}

export async function getQuizAttempts(enrollmentId: string, quizId: string): Promise<QuizAttempt[]> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("get_quiz_attempts", {
    p_enrollment_id: enrollmentId,
    p_quiz_id: quizId,
  });
  if (error) throw new Error("No fue posible cargar los intentos.", { cause: error });
  const parsed = quizAttemptSchema.array().safeParse(data);
  if (!parsed.success) throw new Error("Supabase devolvió intentos inválidos.");
  return parsed.data.map(mapQuizAttempt);
}

export async function getQuizAttemptResult(attemptId: string): Promise<QuizAttemptResult> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("get_quiz_attempt_result", { p_attempt_id: attemptId });
  if (error) throw new Error("No fue posible cargar el resultado.", { cause: error });
  const parsed = quizAttemptResultSchema.safeParse(data);
  if (!parsed.success) throw new Error("Supabase devolvió un resultado inválido.");
  return mapQuizAttemptResult(parsed.data);
}
