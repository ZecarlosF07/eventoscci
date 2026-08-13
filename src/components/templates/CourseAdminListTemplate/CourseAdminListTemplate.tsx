import Link from "next/link";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Text } from "@/components/atoms/Text";
import { FormField } from "@/components/molecules/FormField";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import type { CourseAdminListTemplateProps } from "@/components/templates/CourseAdminListTemplate/types/course-admin-list-template.types";
import { ROUTES } from "@/constants/routes";
import { CourseAdminTable } from "@/features/courses/components/CourseAdminTable";
import { COURSE_STATUS_LABELS } from "@/features/courses/constants/course.constants";

export function CourseAdminListTemplate({ data, filters }: CourseAdminListTemplateProps) {
  return <div className="space-y-7">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><SectionHeading description={`${data.total} cursos activos en el sistema.`} eyebrow="Campus Virtual" title="Cursos" /><Link className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white" href={`${ROUTES.adminCourses}/nuevo`}>Nuevo curso</Link></div>
    <form className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_240px_auto]">
      <FormField label="Buscar por título" name="q"><Input defaultValue={filters.query} id="q" name="q" /></FormField>
      <FormField label="Estado" name="estado"><Select defaultValue={filters.status ?? ""} id="estado" name="estado"><option value="">Todos</option>{Object.entries(COURSE_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></FormField>
      <div className="flex items-end"><Button type="submit">Filtrar</Button></div>
    </form>
    <CourseAdminTable courses={data.courses} />
    <div className="flex items-center justify-between"><Text size="sm">Página {data.page} de {data.pageCount}</Text><div className="flex gap-2">{data.page > 1 ? <Link className="rounded-lg border px-3 py-2 text-sm font-semibold" href={`${ROUTES.adminCourses}?pagina=${data.page - 1}`}>Anterior</Link> : null}{data.page < data.pageCount ? <Link className="rounded-lg border px-3 py-2 text-sm font-semibold" href={`${ROUTES.adminCourses}?pagina=${data.page + 1}`}>Siguiente</Link> : null}</div></div>
  </div>;
}
