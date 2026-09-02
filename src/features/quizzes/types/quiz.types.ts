export interface QuizOptionDraft {
  id: string;
  isCorrect: boolean;
  optionText: string;
}

export interface QuizQuestionDraft {
  explanation: string;
  id: string;
  options: QuizOptionDraft[];
  prompt: string;
}

export interface AdminQuiz {
  description: string | null;
  id: string;
  isPublished: boolean;
  moduleId: string;
  passingScore: number;
  questions: QuizQuestionDraft[];
  title: string;
}

export interface QuizSaveState {
  errors?: Record<string, string[]>;
  message?: string;
  quizId?: string;
  success?: boolean;
}

export interface StudentQuizOption {
  id: string;
  optionText: string;
  sortOrder: number;
}

export interface StudentQuizQuestion {
  id: string;
  options: StudentQuizOption[];
  prompt: string;
  sortOrder: number;
}

export interface StudentQuiz {
  description: string | null;
  enrollmentId: string;
  id: string;
  moduleId: string;
  passingScore: number;
  questions: StudentQuizQuestion[];
  title: string;
}

export interface QuizSummary {
  attemptCount: number;
  bestScore: number | null;
  id: string;
  isPassed: boolean;
  moduleId: string;
  passingScore: number;
  title: string;
}

export interface QuizAttempt {
  attemptNumber: number;
  correctAnswers: number;
  id: string;
  isPassed: boolean;
  scorePercent: number;
  submittedAt: string;
  totalQuestions: number;
}

export interface QuizAttemptAnswer {
  correctOptionText: string;
  explanation: string | null;
  isCorrect: boolean;
  questionId: string;
  questionText: string;
  selectedOptionId: string;
  selectedOptionText: string;
}

export interface QuizAttemptResult extends QuizAttempt {
  answers: QuizAttemptAnswer[];
  courseCompletionReady?: boolean;
  enrollmentId: string;
  quizId: string;
}

export interface QuizAnswerInput {
  questionId: string;
  selectedOptionId: string;
}

export interface QuizEditorProps {
  courseId: string;
  initialQuiz: AdminQuiz | null;
  moduleId: string;
  moduleTitle: string;
}

export interface QuizQuestionEditorProps {
  index: number;
  onChange: (question: QuizQuestionDraft) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  question: QuizQuestionDraft;
  questionCount: number;
}

export interface QuizOptionEditorProps {
  index: number;
  onChange: (option: QuizOptionDraft) => void;
  onCorrect: () => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  option: QuizOptionDraft;
  optionCount: number;
  questionId: string;
}

export interface StudentQuizFormProps {
  initialAttempts: QuizAttempt[];
  onAttemptSubmitted?: (result: QuizAttemptResult) => void;
  quiz: StudentQuiz;
  tone?: "dark" | "light";
}

export interface QuizResultProps {
  result: QuizAttemptResult;
  tone?: "dark" | "light";
}

export interface QuizAttemptHistoryProps {
  attempts: QuizAttempt[];
  tone?: "dark" | "light";
}

export interface AdminQuizPageProps {
  params: Promise<{ id: string; moduleId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}
