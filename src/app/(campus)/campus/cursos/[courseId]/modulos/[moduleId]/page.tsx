import { notFound } from "next/navigation";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import { CoursePlayerTemplate } from "@/components/templates/CoursePlayerTemplate";
import { CourseModulesList } from "@/features/courses/components/CourseModulesList";
import { getStudentCourseContent } from "@/features/courses/queries/get-my-courses";
import type { StudentModulePageProps } from "@/features/courses/types/course-page.types";
export default async function CourseModulePage({ params }: StudentModulePageProps) { const { courseId, moduleId } = await params; const content = await getStudentCourseContent(courseId); if (!content) notFound(); const courseModule = content.modules.find((item) => item.id === moduleId); if (!courseModule) notFound(); const lessons = content.lessons.filter((item) => item.module_id === moduleId); return <CoursePlayerTemplate content={content} section="content"><div className="space-y-5"><Heading level={2}>{courseModule.title}</Heading>{courseModule.description ? <Text>{courseModule.description}</Text> : null}<CourseModulesList courseId={courseId} lessons={lessons} modules={[courseModule]} /></div></CoursePlayerTemplate>; }
