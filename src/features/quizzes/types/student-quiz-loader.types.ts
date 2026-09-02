import type { QuizAttempt, StudentQuiz } from "@/features/quizzes/types/quiz.types";

export interface LoadedStudentQuiz {
  attempts: QuizAttempt[];
  quiz: StudentQuiz;
}

export interface StudentQuizLoadState {
  data?: LoadedStudentQuiz;
  error?: string;
  isLoading: boolean;
  recordAttempt: (attempt: QuizAttempt) => void;
}
