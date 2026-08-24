import { notFound } from "next/navigation";

import { CoursePlayerTemplate } from "@/components/templates/CoursePlayerTemplate";
import { CourseModulesList } from "@/features/courses/components/CourseModulesList";
import { getStudentCourseContent } from "@/features/courses/queries/get-my-courses";
import type { StudentCoursePageProps } from "@/features/courses/types/course-page.types";

export default async function CourseContentPage({ params }: StudentCoursePageProps) {
  const { courseId } = await params;
  const content = await getStudentCourseContent(courseId);
  if (!content) notFound();
  return (
    <CoursePlayerTemplate content={content} section="content">
      <CourseModulesList
        courseId={courseId}
        lessonProgress={content.lessonProgress}
        lessons={content.lessons}
        modules={content.modules}
        quizSummaries={content.quizSummaries}
      />
    </CoursePlayerTemplate>
  );
}
