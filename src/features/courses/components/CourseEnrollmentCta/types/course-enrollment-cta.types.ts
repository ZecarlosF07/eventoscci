import type { CourseEnrollmentStatus } from "@/features/courses/types/course.types";

export interface CourseEnrollmentCtaProps {
  courseId: string;
  courseTitle: string;
  enrollmentStatus: CourseEnrollmentStatus | null;
  isAuthenticated: boolean;
  isFree: boolean;
  nextPath: string;
  variant?: "compact" | "default";
}
