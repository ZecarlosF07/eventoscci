import type { CourseModule, Lesson } from "@/features/courses/types/course.types";
export interface CourseModulesListProps { courseId: string; lessons: Lesson[]; modules: CourseModule[] }
