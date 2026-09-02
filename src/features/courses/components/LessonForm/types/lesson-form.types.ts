import type { Lesson } from "@/features/courses/types/course.types";
export interface LessonFormProps { courseId: string; defaultSortOrder?: number; lesson?: Lesson; moduleId: string }
