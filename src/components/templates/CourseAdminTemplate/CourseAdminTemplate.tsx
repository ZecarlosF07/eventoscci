import Link from "next/link";

import { Badge } from "@/components/atoms/Badge";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import type { CourseAdminTemplateProps } from "@/components/templates/CourseAdminTemplate/types/course-admin-template.types";
import { getAdminCourseContentRoute, getAdminCourseMaterialsRoute, getAdminCourseRoute, getAdminCourseStudentsRoute } from "@/features/courses/utils/course-routes";

export function CourseAdminTemplate({ children, course, section }: CourseAdminTemplateProps) {
  const links = [
    { href: getAdminCourseRoute(course.id), id: "info", label: "Información" },
    { href: getAdminCourseContentRoute(course.id), id: "content", label: "Módulos y clases" },
    { href: getAdminCourseMaterialsRoute(course.id), id: "materials", label: "Materiales" },
    { href: getAdminCourseStudentsRoute(course.id), id: "students", label: "Alumnos" },
  ];
  return <div className="space-y-7">
    <header><Link className="text-sm font-semibold text-slate-600" href="/admin/cursos">← Todos los cursos</Link><div className="mt-4 flex flex-wrap items-center gap-3"><Heading level={1}>{course.title}</Heading><Badge>{course.status}</Badge></div><Text className="mt-2" size="sm">Administra la estructura académica y los accesos desde una sola ficha.</Text></header>
    <nav className="flex flex-wrap gap-2 border-b border-cci-100 pb-3">{links.map((link) => <Link className={link.id === section ? "rounded-lg bg-cci-950 px-4 py-2 text-sm font-semibold text-white" : "rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"} href={link.href} key={link.id}>{link.label}</Link>)}</nav>
    {children}
  </div>;
}
