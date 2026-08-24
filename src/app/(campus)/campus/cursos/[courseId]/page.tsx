import { notFound } from "next/navigation";

import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import { CoursePlayerTemplate } from "@/components/templates/CoursePlayerTemplate";
import { CourseModulesList } from "@/features/courses/components/CourseModulesList";
import { getStudentCourseContent } from "@/features/courses/queries/get-my-courses";
import type { StudentCoursePageProps } from "@/features/courses/types/course-page.types";
import { CourseProgressSummary } from "@/features/progress/components/CourseProgressSummary";
import { getCourseProgressCounts } from "@/features/progress/utils/progress";
import { CourseRatingForm } from "@/features/ratings/components/CourseRatingForm";
import { getMyCourseRating } from "@/features/ratings/queries/get-course-rating";

export default async function CampusCoursePage({ params }: StudentCoursePageProps) {
  const { courseId } = await params;
  const content = await getStudentCourseContent(courseId);
  if (!content) notFound();
  const counts = getCourseProgressCounts(content.lessons, content.lessonProgress);
  const rating = content.enrollment.status === "completed" ? await getMyCourseRating(courseId) : null;

  return (
    <CoursePlayerTemplate content={content} section="overview">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.45fr]">
        <section>
          <Heading level={2}>Acerca del curso</Heading>
          <Text className="mt-3 whitespace-pre-line">{content.course.description}</Text>
          {content.course.objectives ? (
            <>
              <Heading className="mt-8" level={2}>Objetivos</Heading>
              <Text className="mt-3 whitespace-pre-line">{content.course.objectives}</Text>
            </>
          ) : null}
        </section>
        <CourseProgressSummary
          completedLessons={counts.completed}
          pendingLessons={counts.pending}
          progressPercent={content.enrollment.progress_percent}
          totalLessons={counts.total}
        />
      </div>
      <section className="mt-8">
        <Heading level={2}>Contenido disponible</Heading>
        <div className="mt-4">
          <CourseModulesList
            courseId={courseId}
            lessonProgress={content.lessonProgress}
            lessons={content.lessons}
            modules={content.modules}
            quizSummaries={content.quizSummaries}
          />
        </div>
      </section>
      {content.enrollment.status === "completed" ? (
        <div className="mt-8"><CourseRatingForm courseId={courseId} rating={rating} /></div>
      ) : null}
    </CoursePlayerTemplate>
  );
}
