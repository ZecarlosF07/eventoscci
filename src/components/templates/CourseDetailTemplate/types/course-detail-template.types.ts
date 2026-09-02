import type { CurrentAccount } from "@/features/auth/types/auth.types";
import type { CourseDetail, CourseEnrollmentStatus } from "@/features/courses/types/course.types";
import type { PublicCourseCurriculumModule } from "@/features/courses/types/public-course-curriculum.types";

export interface CourseDetailTemplateProps {
  account: CurrentAccount | null;
  course: CourseDetail;
  curriculum: PublicCourseCurriculumModule[];
  enrollmentStatus: CourseEnrollmentStatus | null;
}
