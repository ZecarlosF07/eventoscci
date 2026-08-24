"use client";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import type { QuizOptionEditorProps } from "@/features/quizzes/types/quiz.types";

export function QuizOptionEditor({
  index,
  onChange,
  onCorrect,
  onMove,
  onRemove,
  option,
  optionCount,
  questionId,
}: QuizOptionEditorProps) {
  return (
    <div className="grid gap-2 rounded-xl bg-slate-50 p-3 sm:grid-cols-[auto_1fr_auto] sm:items-center">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <input
          checked={option.isCorrect}
          className="size-4 accent-slate-950"
          name={`correct_${questionId}`}
          onChange={onCorrect}
          type="radio"
        />
        Correcta
      </label>
      <Input
        aria-label={`Alternativa ${index + 1}`}
        onChange={(event) => onChange({ ...option, optionText: event.target.value })}
        placeholder={`Alternativa ${index + 1}`}
        value={option.optionText}
      />
      <div className="flex gap-1">
        <Button disabled={index === 0} onClick={() => onMove(-1)} type="button" variant="subtle">↑</Button>
        <Button disabled={index === optionCount - 1} onClick={() => onMove(1)} type="button" variant="subtle">↓</Button>
        <Button disabled={optionCount <= 2} onClick={onRemove} type="button" variant="secondary">Quitar</Button>
      </div>
    </div>
  );
}
