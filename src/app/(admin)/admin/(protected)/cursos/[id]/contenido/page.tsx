import { notFound } from "next/navigation";
import { CourseAdminTemplate } from "@/components/templates/CourseAdminTemplate";
import { CourseContentManager } from "@/features/courses/components/CourseContentManager";
import { getAdminCourseContent } from "@/features/courses/queries/get-course-by-id";
import type { CoursePageProps } from "@/features/courses/types/course-form.types";

export default async function CourseContentPage({ params }: CoursePageProps) {
  const { id } = await params;
  const course = await getAdminCourseContent(id);
  if (!course) notFound();
  return <CourseAdminTemplate course={course} section="content"><CourseContentManager courseId={course.id} lessons={course.lessons} modules={course.modules} /></CourseAdminTemplate>;
}
