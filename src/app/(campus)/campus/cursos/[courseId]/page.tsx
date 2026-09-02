import { notFound } from "next/navigation";

import { CourseLearningWorkspace } from "@/features/courses/components/CourseLearningWorkspace";
import { getStudentCourseContent } from "@/features/courses/queries/get-my-courses";
import type { StudentCoursePageProps } from "@/features/courses/types/course-page.types";
import { CourseRatingForm } from "@/features/ratings/components/CourseRatingForm";
import { getMyCourseRating } from "@/features/ratings/queries/get-course-rating";

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CampusCoursePage({ params, searchParams }: StudentCoursePageProps) {
  const [{ courseId }, query] = await Promise.all([params, searchParams]);
  const content = await getStudentCourseContent(courseId);
  if (!content) notFound();
  const rating = content.enrollment.status === "completed" ? await getMyCourseRating(courseId) : null;
  return (
    <div className="relative left-1/2 -my-7 min-h-[calc(100vh-5rem)] w-screen -translate-x-1/2 bg-[#080b0a] px-4 py-7 text-white sm:-my-10 sm:px-6 sm:py-10 lg:-my-12 lg:px-8 lg:py-12">
      <div className="mx-auto w-full max-w-[96rem]">
        <CourseLearningWorkspace
          content={content}
          initialPanel={firstValue(query.panel) === "recursos" ? "resources" : "curriculum"}
          requestedLessonId={firstValue(query.clase)}
          requestedQuizModuleId={firstValue(query.quiz)}
        />
        {content.enrollment.status === "completed" ? <div className="mt-6"><CourseRatingForm courseId={courseId} rating={rating} tone="dark" /></div> : null}
      </div>
    </div>
  );
}
