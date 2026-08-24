"use client";

import { Button } from "@/components/atoms/Button";
import { Heading } from "@/components/atoms/Heading";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { FormField } from "@/components/molecules/FormField";
import { QuizOptionEditor } from "@/features/quizzes/components/QuizOptionEditor";
import type {
  QuizOptionDraft,
  QuizQuestionEditorProps,
} from "@/features/quizzes/types/quiz.types";
import { createQuizOption, moveItem } from "@/features/quizzes/utils/quiz";

export function QuizQuestionEditor({
  index,
  onChange,
  onMove,
  onRemove,
  question,
  questionCount,
}: QuizQuestionEditorProps) {
  function updateOption(optionIndex: number, option: QuizOptionDraft) {
    onChange({
      ...question,
      options: question.options.map((item, indexValue) => indexValue === optionIndex ? option : item),
    });
  }

  function markCorrect(optionIndex: number) {
    onChange({
      ...question,
      options: question.options.map((option, indexValue) => ({
        ...option,
        isCorrect: indexValue === optionIndex,
      })),
    });
  }

  return (
    <article className="space-y-5 rounded-2xl border border-cci-100 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Heading level={3}>Pregunta {index + 1}</Heading>
        <div className="flex gap-2">
          <Button disabled={index === 0} onClick={() => onMove(-1)} type="button" variant="subtle">Subir</Button>
          <Button disabled={index === questionCount - 1} onClick={() => onMove(1)} type="button" variant="subtle">Bajar</Button>
          <Button onClick={onRemove} type="button" variant="secondary">Eliminar</Button>
        </div>
      </div>
      <FormField label="Pregunta" name={`prompt_${question.id}`}>
        <Input
          id={`prompt_${question.id}`}
          onChange={(event) => onChange({ ...question, prompt: event.target.value })}
          required
          value={question.prompt}
        />
      </FormField>
      <FormField label="Explicación después del intento (opcional)" name={`explanation_${question.id}`}>
        <Textarea
          id={`explanation_${question.id}`}
          onChange={(event) => onChange({ ...question, explanation: event.target.value })}
          value={question.explanation}
        />
      </FormField>
      <div className="space-y-3">
        {question.options.map((option, optionIndex) => (
          <QuizOptionEditor
            index={optionIndex}
            key={option.id}
            onChange={(next) => updateOption(optionIndex, next)}
            onCorrect={() => markCorrect(optionIndex)}
            onMove={(direction) => onChange({ ...question, options: moveItem(question.options, optionIndex, direction) })}
            onRemove={() => onChange({ ...question, options: question.options.filter((_, itemIndex) => itemIndex !== optionIndex) })}
            option={option}
            optionCount={question.options.length}
            questionId={question.id}
          />
        ))}
        <Button
          onClick={() => onChange({ ...question, options: [...question.options, createQuizOption()] })}
          type="button"
          variant="secondary"
        >
          Agregar alternativa
        </Button>
      </div>
    </article>
  );
}
