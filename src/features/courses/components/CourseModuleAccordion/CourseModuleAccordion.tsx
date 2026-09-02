"use client";

import { useState } from "react";

import { Badge } from "@/components/atoms/Badge";
import type { CourseModuleAccordionProps } from "@/features/courses/types/course-learning.types";
import { formatLessonDuration } from "@/features/courses/utils/course-formatters";

export function CourseModuleAccordion({
  index,
  initiallyOpen,
  lessons,
  module,
  onSelect,
  progress,
  quiz,
  selection,
}: CourseModuleAccordionProps) {
  const selectedHere = selection?.kind === "lesson"
    ? lessons.some((lesson) => lesson.id === selection.lessonId)
    : selection?.kind === "quiz" && selection.moduleId === module.id;
  const [open, setOpen] = useState(initiallyOpen || selectedHere);
  const expanded = open || selectedHere;
  const progressByLesson = new Map(progress.map((item) => [item.lesson_id, item]));
  const completed = lessons.filter((lesson) => progressByLesson.get(lesson.id)?.is_completed).length;
  const duration = lessons.reduce((total, lesson) => total + (lesson.duration_seconds ?? 0), 0);

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#171e1b]">
      <button aria-expanded={expanded} className="w-full p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cci-lime" onClick={() => setOpen((value) => !value)} type="button">
        <span className="flex items-start justify-between gap-3">
          <span><span className="text-xs font-bold uppercase tracking-wide text-cci-lime">Módulo {index + 1}</span><span className="mt-1 block font-semibold text-white">{module.title}</span></span>
          <span aria-hidden="true" className="text-xl text-cci-lime">{expanded ? "−" : "+"}</span>
        </span>
        <span className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400"><span>{lessons.length} clases</span><span>·</span><span>{Math.ceil(duration / 60)} min</span><span>·</span><span>{completed}/{lessons.length} completadas</span></span>
      </button>
      {expanded ? (
        <div className="border-t border-white/10 p-2">
          {lessons.map((lesson, lessonIndex) => {
            const lessonProgress = progressByLesson.get(lesson.id);
            const active = selection?.kind === "lesson" && selection.lessonId === lesson.id;
            return (
              <button className={active ? "flex w-full items-center gap-3 rounded-xl bg-cci-lime px-3 py-3 text-left text-cci-950" : "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-slate-300 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-cci-lime"} key={lesson.id} onClick={() => onSelect({ kind: "lesson", lessonId: lesson.id })} type="button">
                <span aria-hidden="true" className={lessonProgress?.is_completed ? "grid size-6 shrink-0 place-items-center rounded-full bg-cci-lime text-xs font-black text-cci-950" : "grid size-6 shrink-0 place-items-center rounded-full border border-current text-xs"}>{lessonProgress?.is_completed ? "✓" : "▶"}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{index + 1}.{lessonIndex + 1} · {lesson.title}</span>
                <span className="shrink-0 text-xs opacity-70">{formatLessonDuration(lesson.duration_seconds) ?? "—"}</span>
              </button>
            );
          })}
          {quiz ? (
            <button className={selection?.kind === "quiz" && selection.moduleId === module.id ? "mt-1 flex w-full items-center gap-3 rounded-xl bg-cci-lime px-3 py-3 text-left text-cci-950" : "mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-slate-300 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-cci-lime"} onClick={() => onSelect({ kind: "quiz", moduleId: module.id })} type="button">
              <span aria-hidden="true" className="grid size-6 shrink-0 place-items-center rounded-full border border-current text-xs">?</span><span className="min-w-0 flex-1 truncate text-sm font-semibold">{quiz.title}</span><Badge variant={quiz.isPassed ? "success" : "warning"}>{quiz.isPassed ? "Aprobado" : "Pendiente"}</Badge>
            </button>
          ) : null}
          {!lessons.length && !quiz ? <p className="px-3 py-4 text-sm text-slate-400">Sin contenido publicado.</p> : null}
        </div>
      ) : null}
    </section>
  );
}
