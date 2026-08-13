import type { ReactNode } from "react";
import type { StudentCourseContent } from "@/features/courses/types/course.types";
export interface CoursePlayerTemplateProps { children?: ReactNode; content: StudentCourseContent; section: "overview" | "content" | "materials" }
