import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import type { CourseCurriculumPreviewProps } from "@/features/courses/components/CourseCurriculumPreview/types/course-curriculum-preview.types";
import { formatLessonDuration } from "@/features/courses/utils/course-formatters";

function getModuleDuration(seconds: number): string {
  if (!seconds) return "Duración por confirmar";
  const minutes = Math.ceil(seconds / 60);
  return minutes >= 60 ? `${Math.floor(minutes / 60)} h ${minutes % 60} min` : `${minutes} min`;
}

export function CourseCurriculumPreview({ modules }: CourseCurriculumPreviewProps) {
  return (
    <section className="rounded-3xl border border-cci-100 bg-white p-5 sm:p-7" aria-labelledby="course-modules-title">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-cci-600">Plan de formación</p>
      <Heading className="mt-2" id="course-modules-title" level={2}>Contenido del curso</Heading>
      {modules.length ? (
        <ol className="mt-5 space-y-3">
          {modules.map((module, index) => (
            <li key={module.id}>
              <details className="group rounded-2xl border border-cci-100 bg-cci-50 open:border-cci-200" open={index === 0}>
                <summary className="cursor-pointer list-none p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-600">
                  <div className="flex items-start justify-between gap-4">
                    <div><span className="text-xs font-bold uppercase text-cci-600">Módulo {index + 1}</span><p className="mt-1 font-semibold text-cci-950">{module.title}</p></div>
                    <div className="shrink-0 text-right text-xs text-slate-500"><p>{module.lessons.length} clases</p><p>{getModuleDuration(module.lessons.reduce((total, lesson) => total + (lesson.durationSeconds ?? 0), 0))}</p></div>
                  </div>
                  {module.description ? <Text className="mt-2 line-clamp-2" size="sm">{module.description}</Text> : null}
                </summary>
                <ol className="border-t border-cci-100 px-4 py-2">
                  {module.lessons.map((lesson, lessonIndex) => (
                    <li className="flex items-start justify-between gap-4 border-b border-cci-100 py-3 last:border-0" key={`${module.id}-${lesson.sortOrder}`}>
                      <span className="flex gap-3 text-sm text-cci-950"><span aria-hidden="true" className="font-bold text-cci-600">▷</span><span>{index + 1}.{lessonIndex + 1} · {lesson.title}{lesson.isRequired ? <span className="ml-2 text-xs text-slate-500">Obligatoria</span> : null}</span></span>
                      <span className="shrink-0 text-xs text-slate-500">{formatLessonDuration(lesson.durationSeconds) ?? "—"}</span>
                    </li>
                  ))}
                  {!module.lessons.length ? <li className="py-3 text-sm text-slate-500">Las clases se publicarán próximamente.</li> : null}
                </ol>
              </details>
            </li>
          ))}
        </ol>
      ) : <Text className="mt-4">El contenido se publicará próximamente.</Text>}
      <Text className="mt-4" size="sm">Los videos, evaluaciones y materiales se habilitan dentro del Campus al obtener acceso.</Text>
    </section>
  );
}
