import { redirect } from "next/navigation";

import type { StudentCoursePageProps } from "@/features/courses/types/course-page.types";
import { getCampusCourseRoute } from "@/features/courses/utils/course-routes";

export default async function CourseContentPage({ params }: Pick<StudentCoursePageProps, "params">) {
  const { courseId } = await params;
  redirect(getCampusCourseRoute(courseId));
}
