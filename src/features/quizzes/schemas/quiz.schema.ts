import { z } from "zod";

const nullableText = z.string().nullable();

const adminOptionSchema = z.object({
  id: z.string().uuid(),
  is_correct: z.boolean(),
  option_text: z.string(),
  sort_order: z.number().int(),
});

const adminQuestionSchema = z.object({
  explanation: nullableText,
  id: z.string().uuid(),
  options: z.array(adminOptionSchema),
  prompt: z.string(),
  sort_order: z.number().int(),
});

export const adminQuizSchema = z.object({
  description: nullableText,
  id: z.string().uuid(),
  is_published: z.boolean(),
  module_id: z.string().uuid(),
  passing_score: z.number(),
  questions: z.array(adminQuestionSchema),
  title: z.string(),
});

const draftOptionSchema = z.object({
  id: z.string().min(1),
  isCorrect: z.boolean(),
  optionText: z.string().trim().min(1, "Completa el texto de cada alternativa."),
});

const draftQuestionSchema = z.object({
  explanation: z.string(),
  id: z.string().min(1),
  options: z.array(draftOptionSchema).min(2, "Agrega al menos dos alternativas."),
  prompt: z.string().trim().min(3, "La pregunta debe tener al menos 3 caracteres."),
}).superRefine((question, context) => {
  if (question.options.filter((option) => option.isCorrect).length !== 1) {
    context.addIssue({
      code: "custom",
      message: "Selecciona exactamente una respuesta correcta.",
      path: ["options"],
    });
  }
});

export const quizSaveFormSchema = z.object({
  courseId: z.string().uuid(),
  description: z.string(),
  id: z.string().uuid().or(z.literal("")),
  isPublished: z.boolean(),
  moduleId: z.string().uuid(),
  questions: z.array(draftQuestionSchema),
  title: z.string().trim().min(3, "El título debe tener al menos 3 caracteres."),
}).superRefine((quiz, context) => {
  if (quiz.isPublished && quiz.questions.length === 0) {
    context.addIssue({ code: "custom", message: "Agrega una pregunta antes de publicar.", path: ["questions"] });
  }
});

const studentOptionSchema = z.object({
  id: z.string().uuid(),
  option_text: z.string(),
  sort_order: z.number().int(),
});

const studentQuestionSchema = z.object({
  id: z.string().uuid(),
  options: z.array(studentOptionSchema),
  prompt: z.string(),
  sort_order: z.number().int(),
});

export const studentQuizSchema = z.object({
  description: nullableText,
  enrollment_id: z.string().uuid(),
  id: z.string().uuid(),
  module_id: z.string().uuid(),
  passing_score: z.number(),
  questions: z.array(studentQuestionSchema).min(1),
  title: z.string(),
});

export const quizSummarySchema = z.object({
  attempt_count: z.number().int().nonnegative(),
  best_score: z.number().nullable(),
  id: z.string().uuid(),
  is_passed: z.boolean(),
  module_id: z.string().uuid(),
  passing_score: z.number(),
  title: z.string(),
});

export const quizAttemptSchema = z.object({
  attempt_number: z.number().int().positive(),
  correct_answers: z.number().int().nonnegative(),
  id: z.string().uuid(),
  is_passed: z.boolean(),
  score_percent: z.number(),
  submitted_at: z.string(),
  total_questions: z.number().int().positive(),
});

const quizAttemptAnswerSchema = z.object({
  correct_option_text: z.string(),
  explanation: nullableText,
  is_correct: z.boolean(),
  question_id: z.string().uuid(),
  question_text: z.string(),
  selected_option_id: z.string().uuid(),
  selected_option_text: z.string(),
});

export const quizAttemptResultSchema = quizAttemptSchema.extend({
  answers: z.array(quizAttemptAnswerSchema),
  course_completion_ready: z.boolean().optional(),
  enrollment_id: z.string().uuid(),
  quiz_id: z.string().uuid(),
});
