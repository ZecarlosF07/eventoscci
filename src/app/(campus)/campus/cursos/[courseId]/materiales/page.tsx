import { notFound } from "next/navigation";
import { CoursePlayerTemplate } from "@/components/templates/CoursePlayerTemplate";
import { CourseMaterialsList } from "@/features/courses/components/CourseMaterialsList";
import { getStudentCourseContent } from "@/features/courses/queries/get-my-courses";
import type { StudentCoursePageProps } from "@/features/courses/types/course-page.types";
export default async function CourseMaterialsPage({ params }: StudentCoursePageProps) { const { courseId } = await params; const content = await getStudentCourseContent(courseId); if (!content) notFound(); return <CoursePlayerTemplate content={content} section="materials"><CourseMaterialsList courseId={courseId} materials={content.materials} /></CoursePlayerTemplate>; }
