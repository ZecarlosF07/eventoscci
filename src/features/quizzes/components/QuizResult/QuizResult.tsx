import { Badge } from "@/components/atoms/Badge";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import type { QuizResultProps } from "@/features/quizzes/types/quiz.types";

export function QuizResult({ result }: QuizResultProps) {
  return (
    <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Heading level={2}>Resultado: {result.scorePercent} %</Heading>
          <Text className="mt-1">{result.correctAnswers} de {result.totalQuestions} respuestas correctas.</Text>
        </div>
        <Badge variant={result.isPassed ? "success" : "warning"}>
          {result.isPassed ? "Aprobado" : "No aprobado"}
        </Badge>
      </div>
      {result.courseCompletionReady ? (
        <p className="rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          Completaste todos los requisitos académicos del curso.
        </p>
      ) : null}
      <div className="space-y-4">
        {result.answers.map((answer, index) => (
          <article
            className={answer.isCorrect ? "rounded-2xl border border-emerald-200 bg-emerald-50 p-4" : "rounded-2xl border border-rose-200 bg-rose-50 p-4"}
            key={answer.questionId}
          >
            <p className="font-semibold">{index + 1}. {answer.questionText}</p>
            <p className="mt-2 text-sm">Tu respuesta: {answer.selectedOptionText}</p>
            {!answer.isCorrect ? <p className="mt-1 text-sm font-medium">Respuesta correcta: {answer.correctOptionText}</p> : null}
            {answer.explanation ? <p className="mt-2 text-sm text-slate-600">{answer.explanation}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
