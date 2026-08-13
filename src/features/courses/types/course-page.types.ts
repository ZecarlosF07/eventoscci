import type { CourseStatus } from "@/features/courses/types/course.types";

export interface CourseCatalogPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export interface PublicCoursePageProps {
  params: Promise<{ slug: string }>;
}

export interface StudentCoursePageProps {
  params: Promise<{ courseId: string }>;
}

export interface StudentModulePageProps {
  params: Promise<{ courseId: string; moduleId: string }>;
}

export interface StudentLessonPageProps {
  params: Promise<{ courseId: string; lessonId: string; moduleId: string }>;
}

export function parseCourseAdminFilters(
  params: Record<string, string | string[] | undefined>,
): { page: number; query?: string; status?: CourseStatus } {
  const pageValue = Number(Array.isArray(params.pagina) ? params.pagina[0] : params.pagina);
  const queryValue = Array.isArray(params.q) ? params.q[0] : params.q;
  const statusValue = Array.isArray(params.estado) ? params.estado[0] : params.estado;
  const status = ["draft", "published", "archived"].includes(statusValue ?? "")
    ? statusValue as CourseStatus
    : undefined;
  return {
    page: Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1,
    query: queryValue?.trim() || undefined,
    status,
  };
}
