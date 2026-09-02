import { redirect } from "next/navigation";

import type { StudentQuizPageProps } from "@/features/courses/types/course-page.types";
import { getCampusCourseRoute } from "@/features/courses/utils/course-routes";

export default async function StudentQuizPage({ params }: StudentQuizPageProps) {
  const { courseId, moduleId } = await params;
  redirect(`${getCampusCourseRoute(courseId)}?quiz=${encodeURIComponent(moduleId)}`);
}
