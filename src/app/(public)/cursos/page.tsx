import { CoursesListTemplate } from "@/components/templates/CoursesListTemplate";
import { getPublishedCourses } from "@/features/courses/queries/get-admin-courses";
import type { CourseCatalogPageProps } from "@/features/courses/types/course-page.types";

export default async function CoursesPage({ searchParams }: CourseCatalogPageProps) {
  const params = await searchParams;
  const queryValue = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = queryValue?.trim() || undefined;
  const courses = await getPublishedCourses(query);
  return <CoursesListTemplate courses={courses} query={query} />;
}
