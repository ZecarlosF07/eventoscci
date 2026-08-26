"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/atoms/Button";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Heading } from "@/components/atoms/Heading";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { Text } from "@/components/atoms/Text";
import { Textarea } from "@/components/atoms/Textarea";
import { FormField } from "@/components/molecules/FormField";
import { FormActionNotice } from "@/components/molecules/FormActionNotice";
import { QuizQuestionEditor } from "@/features/quizzes/components/QuizQuestionEditor";
import { saveQuizAction } from "@/features/quizzes/mutations/quiz.actions";
import type {
  QuizEditorProps,
  QuizQuestionDraft,
} from "@/features/quizzes/types/quiz.types";
import { createQuizQuestion, moveItem } from "@/features/quizzes/utils/quiz";
import { usePersistentAction } from "@/hooks/use-persistent-action";

export function QuizEditor({ courseId, initialQuiz, moduleId, moduleTitle }: QuizEditorProps) {
  const { onSubmit, pending, state } = usePersistentAction(saveQuizAction, {});
  const [questions, setQuestions] = useState<QuizQuestionDraft[]>(initialQuiz?.questions ?? []);

  function updateQuestion(index: number, question: QuizQuestionDraft) {
    setQuestions((current) => current.map((item, itemIndex) => itemIndex === index ? question : item));
  }

  return (
    <div className="space-y-7">
      <header>
        <Link className="text-sm font-semibold text-slate-600" href={`/admin/cursos/${courseId}/contenido`}>
          ← Módulos y clases
        </Link>
        <Heading className="mt-4" level={1}>Quiz de {moduleTitle}</Heading>
        <Text className="mt-2">La nota mínima es 80 % y los intentos del alumno son ilimitados.</Text>
      </header>
      <form className="space-y-6" method="post" onSubmit={onSubmit}>
        <input name="course_id" type="hidden" value={courseId} />
        <input name="id" type="hidden" value={state.quizId ?? initialQuiz?.id ?? ""} />
        <input name="module_id" type="hidden" value={moduleId} />
        <input name="questions" type="hidden" value={JSON.stringify(questions)} />
        <section className="grid gap-4 rounded-2xl border border-cci-100 bg-white p-5 md:grid-cols-2">
          <FormField error={state.errors?.title?.[0]} label="Título" name="quiz_title">
            <Input defaultValue={initialQuiz?.title ?? `Evaluación de ${moduleTitle}`} id="quiz_title" name="title" required />
          </FormField>
          <FormField label="Nota mínima" name="passing_score">
            <Input disabled id="passing_score" value="80 %" />
          </FormField>
          <div className="md:col-span-2">
            <FormField label="Descripción (opcional)" name="quiz_description">
              <Textarea defaultValue={initialQuiz?.description ?? ""} id="quiz_description" name="description" />
            </FormField>
          </div>
          <Label className="flex items-center gap-2 md:col-span-2">
            <Checkbox defaultChecked={initialQuiz?.isPublished} name="is_published" /> Publicado para alumnos
          </Label>
        </section>
        <div className="flex items-center justify-between gap-3">
          <Heading level={2}>Preguntas</Heading>
          <Button onClick={() => setQuestions((current) => [...current, createQuizQuestion()])} type="button" variant="secondary">
            Agregar pregunta
          </Button>
        </div>
        {state.errors?.questions?.[0] ? <p className="text-sm font-medium text-rose-700">{state.errors.questions[0]}</p> : null}
        {!questions.length ? (
          <div className="rounded-2xl border border-dashed p-8 text-center"><Text>Agrega la primera pregunta para construir el quiz.</Text></div>
        ) : questions.map((question, index) => (
          <QuizQuestionEditor
            index={index}
            key={question.id}
            onChange={(next) => updateQuestion(index, next)}
            onMove={(direction) => setQuestions((current) => moveItem(current, index, direction))}
            onRemove={() => setQuestions((current) => current.filter((_, itemIndex) => itemIndex !== index))}
            question={question}
            questionCount={questions.length}
          />
        ))}
        <FormActionNotice message={state.message} success={state.success} />
        <Button disabled={pending} type="submit">{pending ? "Guardando…" : "Guardar quiz"}</Button>
      </form>
    </div>
  );
}
