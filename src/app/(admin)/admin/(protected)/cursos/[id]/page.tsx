import { notFound } from "next/navigation";
import { CourseAdminTemplate } from "@/components/templates/CourseAdminTemplate";
import { CourseForm } from "@/features/courses/components/CourseForm";
import { getAdminCourseById } from "@/features/courses/queries/get-course-by-id";
import type { CoursePageProps } from "@/features/courses/types/course-form.types";
import { getActiveSpeakers } from "@/features/speakers/queries/get-active-speakers";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function EditCoursePage({ params }: CoursePageProps) {
  const { id } = await params;
  const client = await createServerSupabaseClient();
  const [course, speakers] = await Promise.all([getAdminCourseById(id), getActiveSpeakers(client)]);
  if (!course) notFound();
  return <CourseAdminTemplate course={course} section="info"><CourseForm course={course} speakers={speakers} /></CourseAdminTemplate>;
}
