"use client";

import { CourseLearningSidebarProps } from "@/features/courses/types/course-learning.types";
import { CourseMaterialsList } from "@/features/courses/components/CourseMaterialsList";
import { CourseModuleAccordion } from "@/features/courses/components/CourseModuleAccordion";
import { ProgressBar } from "@/features/progress/components/ProgressBar";

export function CourseLearningSidebar({
  activePanel,
  content,
  onPanelChange,
  onSelect,
  progress,
  quizSummaries,
  selection,
}: CourseLearningSidebarProps) {
  const selectedModuleId = selection?.kind === "quiz"
    ? selection.moduleId
    : content.lessons.find((lesson) => selection?.kind === "lesson" && lesson.id === selection.lessonId)?.module_id;
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#111614] shadow-2xl shadow-black/20">
      <div className="grid grid-cols-2 border-b border-white/10 bg-[#111614]" role="tablist" aria-label="Panel del curso">
        <Tab active={activePanel === "curriculum"} label="Temario" onClick={() => onPanelChange("curriculum")} />
        <Tab active={activePanel === "resources"} label={`Recursos (${content.materials.length})`} onClick={() => onPanelChange("resources")} />
      </div>
      {activePanel === "curriculum" ? (
        <div className="max-h-[calc(100vh-15rem)] overflow-y-auto p-3 sm:p-4">
          <div className="mb-4 rounded-2xl border border-white/10 bg-[#171e1b] p-4">
            <div className="mb-2 flex justify-between text-xs font-semibold text-slate-300"><span>Avance del curso</span><span>{Math.round(content.enrollment.progress_percent)}%</span></div>
            <ProgressBar label="Avance del curso" showValue={false} tone="dark" value={content.enrollment.progress_percent} />
          </div>
          <div className="space-y-3">
            {content.modules.map((module, index) => (
              <CourseModuleAccordion
                index={index}
                initiallyOpen={module.id === selectedModuleId || (!selectedModuleId && index === 0)}
                key={module.id}
                lessons={content.lessons.filter((lesson) => lesson.module_id === module.id)}
                module={module}
                onSelect={onSelect}
                progress={progress}
                quiz={quizSummaries.find((quiz) => quiz.moduleId === module.id)}
                selection={selection}
              />
            ))}
            {!content.modules.length ? <p className="p-6 text-center text-sm text-slate-400">No hay módulos publicados.</p> : null}
          </div>
        </div>
      ) : (
        <div className="max-h-[calc(100vh-15rem)] overflow-y-auto p-4">
          <p className="mb-4 text-sm text-slate-400">Materiales generales disponibles para este curso.</p>
          <CourseMaterialsList courseId={content.course.id} materials={content.materials} tone="dark" />
        </div>
      )}
    </div>
  );
}

function Tab({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return <button aria-selected={active} className={active ? "border-b-2 border-cci-lime px-4 py-4 text-sm font-bold text-cci-lime" : "border-b-2 border-transparent px-4 py-4 text-sm font-semibold text-slate-400 hover:text-white focus-visible:outline-2 focus-visible:outline-cci-lime"} onClick={onClick} role="tab" type="button">{label}</button>;
}
