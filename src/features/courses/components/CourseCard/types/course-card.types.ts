import type { CourseListItem } from "@/features/courses/types/course.types";

export interface CourseCardProps {
  course: CourseListItem;
  href?: string;
  progressPercent?: number;
}
