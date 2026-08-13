import { notFound } from "next/navigation";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import { CoursePlayerTemplate } from "@/components/templates/CoursePlayerTemplate";
import { CourseModulesList } from "@/features/courses/components/CourseModulesList";
import { getStudentCourseContent } from "@/features/courses/queries/get-my-courses";
import type { StudentCoursePageProps } from "@/features/courses/types/course-page.types";

export default async function CampusCoursePage({ params }: StudentCoursePageProps) {
  const { courseId } = await params;
  const content = await getStudentCourseContent(courseId);
  if (!content) notFound();
  return <CoursePlayerTemplate content={content} section="overview"><div className="grid gap-8 lg:grid-cols-[1fr_0.45fr]"><section><Heading level={2}>Acerca del curso</Heading><Text className="mt-3 whitespace-pre-line">{content.course.description}</Text>{content.course.objectives ? <><Heading className="mt-8" level={2}>Objetivos</Heading><Text className="mt-3 whitespace-pre-line">{content.course.objectives}</Text></> : null}</section><aside><Heading level={2}>Contenido disponible</Heading><div className="mt-4"><CourseModulesList courseId={courseId} lessons={content.lessons} modules={content.modules} /></div></aside></div></CoursePlayerTemplate>;
}
