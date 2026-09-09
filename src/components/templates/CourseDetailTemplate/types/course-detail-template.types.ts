import type { CourseDetail } from "@/features/courses/types/course.types";
import type { PublicCourseCurriculumModule } from "@/features/courses/types/public-course-curriculum.types";

export interface CourseDetailTemplateProps {
  course: CourseDetail;
  curriculum: PublicCourseCurriculumModule[];
}
