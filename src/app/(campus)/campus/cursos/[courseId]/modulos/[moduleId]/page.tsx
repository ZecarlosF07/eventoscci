import { notFound, redirect } from "next/navigation";

import { getStudentCourseContent } from "@/features/courses/queries/get-my-courses";
import type { StudentModulePageProps } from "@/features/courses/types/course-page.types";
import { getCampusCourseRoute } from "@/features/courses/utils/course-routes";

export default async function CourseModulePage({ params }: StudentModulePageProps) {
  const { courseId, moduleId } = await params;
  const content = await getStudentCourseContent(courseId);
  if (!content || !content.modules.some((module) => module.id === moduleId)) notFound();
  const lesson = content.lessons.find((item) => item.module_id === moduleId);
  const suffix = lesson ? `?clase=${encodeURIComponent(lesson.id)}` : "";
  redirect(`${getCampusCourseRoute(courseId)}${suffix}`);
}
