import Link from "next/link";

import { Badge } from "@/components/atoms/Badge";
import { Text } from "@/components/atoms/Text";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import type { CourseAdminTableProps } from "@/features/courses/components/CourseAdminTable/types/course-admin-table.types";
import { changeCourseStatusAction } from "@/features/courses/mutations/course.actions";
import { formatCoursePrice } from "@/features/courses/utils/course-formatters";
import { getAdminCourseContentRoute, getAdminCourseRoute, getAdminCourseStudentsRoute } from "@/features/courses/utils/course-routes";

export function CourseAdminTable({ courses }: CourseAdminTableProps) {
  if (!courses.length) return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><Text>No hay cursos que coincidan con los filtros.</Text></div>;
  return <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
    <table className="w-full text-left text-sm">
      <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Curso</th><th className="px-4 py-3">Precio</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Acciones</th></tr></thead>
      <tbody className="divide-y divide-slate-100">{courses.map((course) => <tr key={course.id}>
        <td className="px-4 py-4"><p className="font-semibold text-slate-950">{course.title}</p><p className="text-slate-500">/{course.slug}</p></td>
        <td className="px-4 py-4">{course.is_free ? <Badge variant="success">Gratuito</Badge> : <span>{formatCoursePrice(course.general_price)}</span>}</td>
        <td className="px-4 py-4"><StatusBadge status={course.status} /></td>
        <td className="px-4 py-4"><div className="flex flex-wrap gap-3">
          <Link className="font-semibold hover:underline" href={getAdminCourseRoute(course.id)}>Editar</Link>
          <Link className="font-semibold hover:underline" href={getAdminCourseContentRoute(course.id)}>Contenido</Link>
          <Link className="font-semibold hover:underline" href={getAdminCourseStudentsRoute(course.id)}>Alumnos</Link>
          {course.status !== "published" ? <form action={changeCourseStatusAction.bind(null, course.id, "published")}><button className="font-semibold text-emerald-800 hover:underline" type="submit">Publicar</button></form> : null}
          {course.status === "published" ? <form action={changeCourseStatusAction.bind(null, course.id, "archived")}><button className="font-semibold text-amber-800 hover:underline" type="submit">Archivar</button></form> : null}
        </div></td>
      </tr>)}</tbody>
    </table>
  </div>;
}
