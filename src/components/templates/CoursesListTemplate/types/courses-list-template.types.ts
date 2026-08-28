import type { CourseListItem } from "@/features/courses/types/course.types";

export interface CoursesListTemplateProps {
  courses: CourseListItem[];
  featuredCourses: CourseListItem[];
  query?: string;
}
