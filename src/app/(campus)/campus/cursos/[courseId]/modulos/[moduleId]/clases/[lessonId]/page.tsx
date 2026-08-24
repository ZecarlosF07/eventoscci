import { notFound } from "next/navigation";

import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import { CoursePlayerTemplate } from "@/components/templates/CoursePlayerTemplate";
import { LessonPlayer } from "@/features/courses/components/LessonPlayer";
import { COURSE_VIDEO_BUCKET } from "@/features/courses/constants/course.constants";
import { getStudentCourseContent } from "@/features/courses/queries/get-my-courses";
import type { StudentLessonPageProps } from "@/features/courses/types/course-page.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function CourseLessonPage({ params }: StudentLessonPageProps) {
  const { courseId, lessonId, moduleId } = await params;
  const content = await getStudentCourseContent(courseId);
  if (!content || !content.modules.some((module) => module.id === moduleId)) notFound();
  const lesson = content.lessons.find(
    (item) => item.id === lessonId && item.module_id === moduleId,
  );
  if (!lesson) notFound();

  let signedStorageUrl: string | undefined;
  if (lesson.video_provider === "supabase" && lesson.video_storage_path) {
    const client = await createServerSupabaseClient();
    const { data } = await client.storage
      .from(COURSE_VIDEO_BUCKET)
      .createSignedUrl(lesson.video_storage_path, 60 * 60);
    signedStorageUrl = data?.signedUrl;
  }

  return (
    <CoursePlayerTemplate content={content} section="content">
      <article className="space-y-6">
        <LessonPlayer
          enrollmentId={content.enrollment.id}
          initialCourseProgressPercent={content.enrollment.progress_percent}
          initialProgress={content.lessonProgress.find((item) => item.lesson_id === lesson.id)}
          lesson={lesson}
          signedStorageUrl={signedStorageUrl}
        />
        <div>
          <Heading level={2}>{lesson.title}</Heading>
          {lesson.description ? (
            <Text className="mt-3 whitespace-pre-line">{lesson.description}</Text>
          ) : null}
        </div>
        <Text className="rounded-xl bg-slate-100 p-4" size="sm">
          La clase se completa automáticamente al visualizar al menos el 90 %. Puedes volver a
          cualquier clase sin bloquear el resto del contenido.
        </Text>
      </article>
    </CoursePlayerTemplate>
  );
}
