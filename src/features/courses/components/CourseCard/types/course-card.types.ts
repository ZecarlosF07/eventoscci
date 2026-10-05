import type { CourseEnrollmentStatus, CourseListItem } from "@/features/courses/types/course.types";

export interface CourseCardProps {
  course: CourseListItem;
  featured?: boolean;
  enrollmentStatus?: CourseEnrollmentStatus;
  href?: string;
  progressPercent?: number;
}
