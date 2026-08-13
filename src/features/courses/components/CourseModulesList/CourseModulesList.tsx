import Link from "next/link";
import { Badge } from "@/components/atoms/Badge";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import type { CourseModulesListProps } from "@/features/courses/components/CourseModulesList/types/course-modules-list.types";
import { formatLessonDuration } from "@/features/courses/utils/course-formatters";
import { getCampusCourseRoute } from "@/features/courses/utils/course-routes";

export function CourseModulesList({ courseId, lessons, modules }: CourseModulesListProps) {
  if (!modules.length) return <div className="rounded-2xl border border-dashed p-8 text-center"><Text>Este curso no tiene módulos publicados.</Text></div>;
  return <div className="space-y-5">{modules.map((module, index) => {
    const moduleLessons = lessons.filter((lesson) => lesson.module_id === module.id);
    return <section className="rounded-2xl border border-slate-200 bg-white p-5" key={module.id}><Link href={`${getCampusCourseRoute(courseId)}/modulos/${module.id}`}><span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Módulo {index + 1}</span><Heading className="mt-1" level={3}>{module.title}</Heading></Link>{module.description ? <Text className="mt-2" size="sm">{module.description}</Text> : null}<ul className="mt-4 divide-y divide-slate-100">{moduleLessons.map((lesson) => <li className="flex items-center justify-between gap-3 py-3" key={lesson.id}><Link className="font-medium hover:underline" href={`${getCampusCourseRoute(courseId)}/modulos/${module.id}/clases/${lesson.id}`}>{lesson.title}</Link><div className="flex gap-2">{lesson.is_required ? <Badge>Obligatoria</Badge> : null}{formatLessonDuration(lesson.duration_seconds) ? <Badge>{formatLessonDuration(lesson.duration_seconds)}</Badge> : null}</div></li>)}{!moduleLessons.length ? <li className="py-3 text-sm text-slate-500">Sin clases publicadas.</li> : null}</ul></section>;
  })}</div>;
}
