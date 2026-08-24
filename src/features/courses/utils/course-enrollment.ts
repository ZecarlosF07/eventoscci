import { ROUTES } from "@/constants/routes";
import type { CourseEnrollmentStatus } from "@/features/courses/types/course.types";

const COURSE_CONTACT_EMAIL = "mesadepartes@camaraica.org.pe";

export function getCourseAccessLabel(status: CourseEnrollmentStatus): string {
  return status === "completed" ? "Revisar curso" : "Continuar curso";
}

export function getCourseContactHref(courseTitle: string): string {
  const subject = encodeURIComponent(`Solicitud de inscripción: ${courseTitle}`);
  return `mailto:${COURSE_CONTACT_EMAIL}?subject=${subject}`;
}

export function getCourseLoginHref(nextPath: string): string {
  return `${ROUTES.login}?next=${encodeURIComponent(nextPath)}`;
}

export function getCourseRegisterHref(nextPath: string): string {
  return `${ROUTES.register}?next=${encodeURIComponent(nextPath)}`;
}
