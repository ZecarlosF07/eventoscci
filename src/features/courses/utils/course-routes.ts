import { ROUTES } from "@/constants/routes";

export function getAdminCourseRoute(courseId: string): string {
  return `${ROUTES.adminCourses}/${courseId}`;
}

export function getAdminCourseContentRoute(courseId: string): string {
  return `${getAdminCourseRoute(courseId)}/contenido`;
}

export function getAdminCourseMaterialsRoute(courseId: string): string {
  return `${getAdminCourseRoute(courseId)}/materiales`;
}

export function getAdminCourseStudentsRoute(courseId: string): string {
  return `${getAdminCourseRoute(courseId)}/alumnos`;
}

export function getPublicCourseRoute(slug: string): string {
  return `${ROUTES.courses}/${slug}`;
}

export function getCampusCourseRoute(courseId: string): string {
  return `${ROUTES.campusCourses}/${courseId}`;
}
