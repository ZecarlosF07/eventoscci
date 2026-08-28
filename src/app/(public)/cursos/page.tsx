import { CoursesListTemplate } from "@/components/templates/CoursesListTemplate";
import { getPublishedCourses } from "@/features/courses/queries/get-admin-courses";
import type { CourseCatalogPageProps } from "@/features/courses/types/course-page.types";

export default async function CoursesPage({ searchParams }: CourseCatalogPageProps) {
  const params = await searchParams;
  const queryValue = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = queryValue?.trim() || undefined;
  const coursesPromise = getPublishedCourses(query);
  const featuredPromise = query ? getPublishedCourses() : coursesPromise;
  const [courses, featuredCourses] = await Promise.all([coursesPromise, featuredPromise]);
  return <CoursesListTemplate courses={courses} featuredCourses={featuredCourses} query={query} />;
}
