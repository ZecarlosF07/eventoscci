import { Badge } from "@/components/atoms/Badge";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import type { QuizAttemptHistoryProps } from "@/features/quizzes/types/quiz.types";

export function QuizAttemptHistory({ attempts, tone = "light" }: QuizAttemptHistoryProps) {
  return (
    <section className="space-y-4">
      <Heading className={tone === "dark" ? "text-white" : undefined} level={2}>Historial de intentos</Heading>
      {!attempts.length ? <Text className={tone === "dark" ? "text-slate-400" : undefined}>Todavía no has enviado ningún intento.</Text> : (
        <div className={tone === "dark" ? "overflow-hidden rounded-2xl border border-white/10 bg-[#171e1b]" : "overflow-hidden rounded-2xl border border-cci-100 bg-white"}>
          <ul className={tone === "dark" ? "divide-y divide-white/10" : "divide-y divide-slate-100"}>
            {attempts.map((attempt) => (
              <li className="flex flex-wrap items-center justify-between gap-3 p-4" key={attempt.id}>
                <div>
                  <p className={tone === "dark" ? "font-semibold text-white" : "font-semibold"}>Intento {attempt.attemptNumber} — {attempt.scorePercent} %</p>
                  <p className={tone === "dark" ? "text-sm text-slate-400" : "text-sm text-slate-500"}>
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
