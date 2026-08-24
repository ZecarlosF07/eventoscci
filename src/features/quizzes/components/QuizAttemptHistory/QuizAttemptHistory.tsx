import { Badge } from "@/components/atoms/Badge";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import type { QuizAttemptHistoryProps } from "@/features/quizzes/types/quiz.types";

export function QuizAttemptHistory({ attempts }: QuizAttemptHistoryProps) {
  return (
    <section className="space-y-4">
      <Heading level={2}>Historial de intentos</Heading>
      {!attempts.length ? <Text>Todavía no has enviado ningún intento.</Text> : (
        <div className="overflow-hidden rounded-2xl border border-cci-100 bg-white">
          <ul className="divide-y divide-slate-100">
            {attempts.map((attempt) => (
              <li className="flex flex-wrap items-center justify-between gap-3 p-4" key={attempt.id}>
                <div>
                  <p className="font-semibold">Intento {attempt.attemptNumber} — {attempt.scorePercent} %</p>
                  <p className="text-sm text-slate-500">
                    {attempt.correctAnswers} de {attempt.totalQuestions} correctas · {new Intl.DateTimeFormat("es-PE", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(attempt.submittedAt))}
                  </p>
                </div>
                <Badge variant={attempt.isPassed ? "success" : "warning"}>
                  {attempt.isPassed ? "Aprobado" : "No aprobado"}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
