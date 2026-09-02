import "server-only";

import { publicCourseCurriculumSchema } from "@/features/courses/schemas/public-course-curriculum.schema";
import type { PublicCourseCurriculumModule } from "@/features/courses/types/public-course-curriculum.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getPublicCourseCurriculum(
  courseId: string,
): Promise<PublicCourseCurriculumModule[]> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("get_public_course_curriculum", {
    p_course_id: courseId,
  });
  if (error) throw new Error("No fue posible cargar el temario público.", { cause: error });
  const parsed = publicCourseCurriculumSchema.safeParse(data);
  if (!parsed.success) throw new Error("Supabase devolvió un temario público inválido.");
  return parsed.data.map((module) => ({
    description: module.description,
    id: module.id,
    lessons: module.lessons.map((lesson) => ({
      durationSeconds: lesson.duration_seconds,
      isRequired: lesson.is_required,
      sortOrder: lesson.sort_order,
      title: lesson.title,
    })),
    sortOrder: module.sort_order,
    title: module.title,
  }));
}
