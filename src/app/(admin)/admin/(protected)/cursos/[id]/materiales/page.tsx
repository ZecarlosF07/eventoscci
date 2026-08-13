import { notFound } from "next/navigation";
import { CourseAdminTemplate } from "@/components/templates/CourseAdminTemplate";
import { CourseMaterialsManager } from "@/features/courses/components/CourseMaterialsManager";
import { getAdminCourseContent } from "@/features/courses/queries/get-course-by-id";
import type { CoursePageProps } from "@/features/courses/types/course-form.types";

export default async function CourseMaterialsPage({ params }: CoursePageProps) {
  const { id } = await params;
  const course = await getAdminCourseContent(id);
  if (!course) notFound();
  return <CourseAdminTemplate course={course} section="materials"><CourseMaterialsManager courseId={course.id} materials={course.materials} /></CourseAdminTemplate>;
}
