import type { CourseDetail, CourseStudent, PersonCourseOption } from "@/features/courses/types/course.types";
export interface CourseStudentsTableProps { course: CourseDetail; people: PersonCourseOption[]; query: string; students: CourseStudent[] }
