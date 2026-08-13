import type { CurrentAccount } from "@/features/auth/types/auth.types";
import type { CourseDetail } from "@/features/courses/types/course.types";
export interface CourseDetailTemplateProps { account: CurrentAccount | null; course: CourseDetail; isEnrolled: boolean }
