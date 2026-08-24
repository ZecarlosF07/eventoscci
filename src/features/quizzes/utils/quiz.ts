import type {
  QuizAttempt,
  QuizAttemptResult,
  QuizQuestionDraft,
} from "@/features/quizzes/types/quiz.types";

export function createQuizQuestion(): QuizQuestionDraft {
  return {
    explanation: "",
    id: crypto.randomUUID(),
    options: [createQuizOption(true), createQuizOption(false)],
    prompt: "",
  };
}

export function createQuizOption(isCorrect = false) {
  return { id: crypto.randomUUID(), isCorrect, optionText: "" };
}

export function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function mapQuizAttempt(row: {
  attempt_number: number;
  correct_answers: number;
  id: string;
  is_passed: boolean;
  score_percent: number;
  submitted_at: string;
  total_questions: number;
}): QuizAttempt {
  return {
    attemptNumber: row.attempt_number,
    correctAnswers: row.correct_answers,
    id: row.id,
    isPassed: row.is_passed,
    scorePercent: row.score_percent,
    submittedAt: row.submitted_at,
    totalQuestions: row.total_questions,
  };
}

export function mapQuizAttemptResult(row: {
  answers: Array<{
    correct_option_text: string;
    explanation: string | null;
    is_correct: boolean;
    question_id: string;
    question_text: string;
    selected_option_id: string;
    selected_option_text: string;
  }>;
  course_completion_ready?: boolean;
  enrollment_id: string;
  quiz_id: string;
} & Parameters<typeof mapQuizAttempt>[0]): QuizAttemptResult {
  return {
    ...mapQuizAttempt(row),
    answers: row.answers.map((answer) => ({
      correctOptionText: answer.correct_option_text,
      explanation: answer.explanation,
      isCorrect: answer.is_correct,
      questionId: answer.question_id,
      questionText: answer.question_text,
      selectedOptionId: answer.selected_option_id,
      selectedOptionText: answer.selected_option_text,
    })),
    courseCompletionReady: row.course_completion_ready,
    enrollmentId: row.enrollment_id,
    quizId: row.quiz_id,
  };
}
