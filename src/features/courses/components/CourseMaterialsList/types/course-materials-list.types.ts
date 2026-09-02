import type { CourseMaterial } from "@/features/courses/types/course.types";
export interface CourseMaterialsListProps { courseId: string; materials: CourseMaterial[]; tone?: "dark" | "light" }
