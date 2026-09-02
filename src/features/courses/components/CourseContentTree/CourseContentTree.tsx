"use client";

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import type { CourseContentTreeProps, CourseEditorSelection } from "@/features/courses/types/course-content.types";
import { formatLessonDuration } from "@/features/courses/utils/course-formatters";

function selected(selection: CourseEditorSelection, kind: "module" | "lesson", id: string) {
  return kind === "module"
    ? selection.kind === "module" && selection.moduleId === id
    : selection.kind === "lesson" && selection.lessonId === id;
}

export function CourseContentTree({ lessons, modules, onSelect, selection }: CourseContentTreeProps) {
  return (
    <aside className="overflow-hidden rounded-3xl border border-cci-100 bg-white xl:sticky xl:top-6">
      <div className="border-b border-cci-100 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-cci-600">Constructor del curso</p>
        <div className="mt-2 flex items-center justify-between gap-3"><h2 className="text-xl font-semibold text-cci-950">Temario</h2><Badge>{modules.length} módulos</Badge></div>
        <Button className="mt-4 w-full" onClick={() => onSelect({ kind: "new_module" })} variant="secondary">+ Nuevo módulo</Button>
      </div>
      <div className="max-h-[calc(100vh-14rem)] space-y-3 overflow-y-auto p-3">
        {modules.map((module, moduleIndex) => {
          const moduleLessons = lessons.filter((lesson) => lesson.module_id === module.id);
          return (
            <section className="rounded-2xl border border-cci-100 bg-cci-50 p-2" key={module.id}>
              <button className={selected(selection, "module", module.id) ? "w-full rounded-xl bg-cci-950 px-3 py-3 text-left text-white" : "w-full rounded-xl px-3 py-3 text-left hover:bg-white focus-visible:outline-2 focus-visible:outline-cci-600"} onClick={() => onSelect({ kind: "module", moduleId: module.id })} type="button">
                <span className="flex items-start justify-between gap-2"><span className="min-w-0"><span className="block text-xs font-bold uppercase opacity-65">Módulo {moduleIndex + 1}</span><span className="mt-1 block truncate font-semibold">{module.title}</span></span><span className={module.is_published ? "text-xs font-bold text-emerald-600" : "text-xs font-bold text-amber-600"}>{module.is_published ? "Visible" : "Borrador"}</span></span>
              </button>
              <div className="mt-1 space-y-1">
                {moduleLessons.map((lesson, lessonIndex) => (
                  <button className={selected(selection, "lesson", lesson.id) ? "flex w-full items-center gap-2 rounded-xl bg-cci-100 px-3 py-2.5 text-left text-cci-950" : "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-slate-600 hover:bg-white focus-visible:outline-2 focus-visible:outline-cci-600"} key={lesson.id} onClick={() => onSelect({ kind: "lesson", lessonId: lesson.id, moduleId: module.id })} type="button">
                    <span aria-hidden="true" className="text-cci-600">▷</span><span className="min-w-0 flex-1 truncate text-sm">{moduleIndex + 1}.{lessonIndex + 1} {lesson.title}</span><span className="text-xs opacity-60">{formatLessonDuration(lesson.duration_seconds) ?? "—"}</span>
                  </button>
                ))}
                <button className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-cci-700 hover:bg-white focus-visible:outline-2 focus-visible:outline-cci-600" onClick={() => onSelect({ kind: "new_lesson", moduleId: module.id })} type="button">+ Agregar clase</button>
              </div>
            </section>
          );
        })}
        {!modules.length ? <p className="p-6 text-center text-sm text-slate-500">Crea el primer módulo para comenzar a organizar las clases.</p> : null}
      </div>
    </aside>
  );
}
