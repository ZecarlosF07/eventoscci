import type { CourseListItem } from "@/features/courses/types/course.types";

export interface CoursesListTemplateProps {
  courses: CourseListItem[];
  featuredCourses: CourseListItem[];
  page: number;
  pageCount: number;
  pathname: string;
  query?: string;
  total: number;
}
