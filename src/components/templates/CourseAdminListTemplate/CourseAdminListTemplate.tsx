import Link from "next/link";

import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { FormField } from "@/components/molecules/FormField";
import { Pagination } from "@/components/molecules/Pagination";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import type { CourseAdminListTemplateProps } from "@/components/templates/CourseAdminListTemplate/types/course-admin-list-template.types";
import { ROUTES } from "@/constants/routes";
import { AutoFilterForm } from "@/features/admin-filters/components/AutoFilterForm";
import { FilterResults } from "@/features/admin-filters/components/FilterWorkspace";
import { CourseAdminTable } from "@/features/courses/components/CourseAdminTable";
import { COURSE_STATUS_LABELS } from "@/features/courses/constants/course.constants";

export function CourseAdminListTemplate({ data, filters }: CourseAdminListTemplateProps) {
  return <div className="space-y-7">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><SectionHeading description={`${data.total} cursos activos en el sistema.`} eyebrow="Campus Virtual" title="Cursos" /><Link className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cci-950 px-4 py-2 text-sm font-semibold text-white" href={`${ROUTES.adminCourses}/nuevo`}>Nuevo curso</Link></div>
    <AutoFilterForm total={data.total} className="grid gap-4 rounded-2xl border border-cci-100 bg-white p-4 lg:grid-cols-[minmax(0,1fr)_240px]" defaults={{}}>
      <FormField label="Buscar por título" name="q"><Input defaultValue={filters.query} id="q" name="q" /></FormField>
      <FormField label="Estado" name="estado"><Select defaultValue={filters.status ?? ""} id="estado" name="estado"><option value="">Todos</option>{Object.entries(COURSE_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></FormField>
    </AutoFilterForm>
    <FilterResults><CourseAdminTable courses={data.courses} /></FilterResults>
    <Pagination page={data.page} pageCount={data.pageCount} pathname={ROUTES.adminCourses} searchParams={{ q: filters.query, estado: filters.status }} />
  </div>;
}
