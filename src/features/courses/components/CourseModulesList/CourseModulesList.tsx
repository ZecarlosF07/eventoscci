import Link from "next/link";

import { Badge } from "@/components/atoms/Badge";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import type { CourseModulesListProps } from "@/features/courses/components/CourseModulesList/types/course-modules-list.types";
import { formatLessonDuration } from "@/features/courses/utils/course-formatters";
import { getCampusCourseRoute } from "@/features/courses/utils/course-routes";
import { LessonProgressBadge } from "@/features/progress/components/LessonProgressBadge";
import { getLessonProgressMap } from "@/features/progress/utils/progress";

export function CourseModulesList({
  courseId,
  lessonProgress,
  lessons,
  modules,
  quizSummaries,
}: CourseModulesListProps) {
  if (!modules.length) {
    return (
      <div className="rounded-2xl border border-dashed p-8 text-center">
        <Text>Este curso no tiene módulos publicados.</Text>
      </div>
    );
  }

  const progressByLesson = getLessonProgressMap(lessonProgress);
  const quizByModule = new Map(quizSummaries.map((quiz) => [quiz.moduleId, quiz]));
  return (
    <div className="space-y-5">
      {modules.map((module, index) => {
        const moduleLessons = lessons.filter((lesson) => lesson.module_id === module.id);
        const quiz = quizByModule.get(module.id);
        return (
          <section className="rounded-2xl border border-cci-100 bg-white p-5" key={module.id}>
            <Link href={`${getCampusCourseRoute(courseId)}/modulos/${module.id}`}>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Módulo {index + 1}
              </span>
              <Heading className="mt-1" level={3}>{module.title}</Heading>
            </Link>
            {module.description ? <Text className="mt-2" size="sm">{module.description}</Text> : null}
            <ul className="mt-4 divide-y divide-slate-100">
              {moduleLessons.map((lesson) => {
                const progress = progressByLesson.get(lesson.id);
                return (
                  <li className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between" key={lesson.id}>
                    <Link
                      className="font-medium hover:underline"
                      href={`${getCampusCourseRoute(courseId)}/modulos/${module.id}/clases/${lesson.id}`}
                    >
                      {lesson.title}
                    </Link>
                    <div className="flex flex-wrap gap-2">
                      <LessonProgressBadge
                        isCompleted={progress?.is_completed}
                        progressPercent={progress?.progress_percent}
                      />
                      {lesson.is_required ? <Badge>Obligatoria</Badge> : <Badge>Opcional</Badge>}
                      {formatLessonDuration(lesson.duration_seconds) ? (
                        <Badge>{formatLessonDuration(lesson.duration_seconds)}</Badge>
                      ) : null}
                    </div>
                  </li>
                );
              })}
              {!moduleLessons.length ? (
                <li className="py-3 text-sm text-slate-500">Sin clases publicadas.</li>
              ) : null}
              {quiz ? (
                <li className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <Link
                    className="font-semibold text-cci-950 hover:underline"
                    href={`${getCampusCourseRoute(courseId)}/modulos/${module.id}/quiz`}
                  >
                    Evaluación: {quiz.title}
                  </Link>
                  <div className="flex flex-wrap gap-2">
                    {quiz.bestScore !== null ? <Badge>Mejor nota: {quiz.bestScore} %</Badge> : null}
                    <Badge variant={quiz.isPassed ? "success" : "warning"}>
                      {quiz.isPassed ? "Aprobado" : quiz.attemptCount ? "Pendiente de aprobar" : "Sin intentar"}
                    </Badge>
                  </div>
                </li>
              ) : null}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
