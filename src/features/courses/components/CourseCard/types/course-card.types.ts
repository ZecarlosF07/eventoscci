import type { CourseEnrollmentStatus, CourseListItem } from "@/features/courses/types/course.types";

export interface CourseCardProps {
  course: CourseListItem;
  enrollmentStatus?: CourseEnrollmentStatus;
  href?: string;
  progressPercent?: number;
}
