import type { CourseDetail, CourseEnrollmentStatus } from "@/features/courses/types/course.types";

export interface CourseConversionProps {
  course: CourseDetail;
  enrollmentStatus: CourseEnrollmentStatus | null;
  isAuthenticated: boolean;
  nextPath: string;
}
