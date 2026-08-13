import type { ReactNode } from "react";
import type { CourseDetail } from "@/features/courses/types/course.types";

export interface CourseAdminTemplateProps { children: ReactNode; course: CourseDetail; section: "info" | "content" | "materials" | "students" }
