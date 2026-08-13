import { CourseAdminListTemplate } from "@/components/templates/CourseAdminListTemplate";
import { getAdminCourses } from "@/features/courses/queries/get-admin-courses";
import { parseCourseAdminFilters } from "@/features/courses/types/course-page.types";

export default async function AdminCoursesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filters = parseCourseAdminFilters(await searchParams);
  const data = await getAdminCourses(filters);
  return <CourseAdminListTemplate data={data} filters={filters} />;
}
