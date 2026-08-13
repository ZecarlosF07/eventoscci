import Link from "next/link";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import type { MyCoursesTemplateProps } from "@/components/templates/MyCoursesTemplate/types/my-courses-template.types";
import { CourseCard } from "@/features/courses/components/CourseCard";
import { getCampusCourseRoute } from "@/features/courses/utils/course-routes";

export function MyCoursesTemplate({ courses }: MyCoursesTemplateProps) {
  return <div className="space-y-8"><header><p className="text-sm font-semibold uppercase tracking-widest text-slate-500">Campus Virtual</p><Heading className="mt-2" level={1}>Mis cursos</Heading><Text className="mt-3">Accede al contenido que la Cámara tiene habilitado para ti.</Text></header>{courses.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{courses.map((course) => <CourseCard course={course} href={getCampusCourseRoute(course.id)} key={course.id} progressPercent={course.enrollment.progress_percent} />)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><Heading level={2}>Aún no tienes cursos habilitados</Heading><Text className="mt-3">Explora el catálogo para inscribirte en un curso gratuito o coordinar uno con costo.</Text><Link className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white" href="/cursos">Ver catálogo</Link></div>}</div>;
}
