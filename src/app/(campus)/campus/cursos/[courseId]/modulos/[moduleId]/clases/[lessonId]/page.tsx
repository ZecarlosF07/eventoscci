import { redirect } from "next/navigation";

import type { StudentLessonPageProps } from "@/features/courses/types/course-page.types";
import { getCampusCourseRoute } from "@/features/courses/utils/course-routes";

export default async function CourseLessonPage({ params }: StudentLessonPageProps) {
  const { courseId, lessonId } = await params;
  redirect(`${getCampusCourseRoute(courseId)}?clase=${encodeURIComponent(lessonId)}`);
}
