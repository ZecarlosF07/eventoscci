"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/atoms/Button";
import { Spinner } from "@/components/atoms/Spinner";
import { Text } from "@/components/atoms/Text";
import { QuizAttemptHistory } from "@/features/quizzes/components/QuizAttemptHistory";
import { QuizResult } from "@/features/quizzes/components/QuizResult";
import { submitQuizAttempt } from "@/features/quizzes/mutations/submit-quiz-attempt";
import type {
  QuizAttempt,
  QuizAttemptResult,
  StudentQuizFormProps,
} from "@/features/quizzes/types/quiz.types";

export function StudentQuizForm({ initialAttempts, onAttemptSubmitted, quiz, tone = "light" }: StudentQuizFormProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [attempts, setAttempts] = useState(initialAttempts);
  const [error, setError] = useState<string>();
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<QuizAttemptResult>();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;
    if (Object.keys(answers).length !== quiz.questions.length) {
      setError("Responde todas las preguntas antes de enviar el intento.");
      return;
    }
    setError(undefined);
    setIsPending(true);
    try {
      const nextResult = await submitQuizAttempt(
        quiz.enrollmentId,
        quiz.id,
        quiz.questions.map((question) => ({
          questionId: question.id,
          selectedOptionId: answers[question.id],
        })),
      );
      setResult(nextResult);
      const nextAttempt: QuizAttempt = nextResult;
      setAttempts((current) => [nextAttempt, ...current]);
      setAnswers({});
      onAttemptSubmitted?.(nextResult);
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error
        ? submissionError.message
        : "No fue posible entregar la evaluación. Tus respuestas siguen seleccionadas; inténtalo nuevamente.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-8">
      {result ? <QuizResult result={result} tone={tone} /> : null}
      <form className="space-y-6" onSubmit={handleSubmit}>
        {quiz.questions.map((question, index) => (
          <fieldset className={tone === "dark" ? "rounded-2xl border border-white/10 bg-[#171e1b] p-5" : "rounded-2xl border border-cci-100 bg-white p-5"} key={question.id}>
            <legend className={tone === "dark" ? "px-1 font-semibold text-white" : "px-1 font-semibold text-cci-950"}>{index + 1}. {question.prompt}</legend>
            <div className="mt-4 space-y-2">
              {question.options.map((option) => (
                <label className={tone === "dark" ? "flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 p-3 text-slate-300 hover:bg-white/5" : "flex cursor-pointer items-start gap-3 rounded-xl border border-cci-100 p-3 hover:bg-cci-50"} key={option.id}>
                  <input
                    checked={answers[question.id] === option.id}
                    className="mt-1 size-4 accent-slate-950"
                    name={`question_${question.id}`}
                    onChange={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))}
                    type="radio"
                  />
                  <span>{option.optionText}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        {error ? <p className="rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-800" role="alert">{error}</p> : null}
        <div className="flex flex-wrap items-center gap-4">
          <Button className={tone === "dark" ? "bg-cci-lime text-cci-950 hover:bg-white" : undefined} disabled={isPending} type="submit">
            {isPending ? <><Spinner className="mr-2" /> Corrigiendo…</> : "Enviar intento"}
          </Button>
          <Text className={tone === "dark" ? "text-slate-400" : undefined} size="sm">Puedes volver a intentarlo sin límite.</Text>
        </div>
      </form>
      <QuizAttemptHistory attempts={attempts} tone={tone} />
    </div>
  );
}
