import "server-only";

import { unstable_cache } from "next/cache";

import { publicCourseCurriculumSchema } from "@/features/courses/schemas/public-course-curriculum.schema";
import type { PublicCourseCurriculumModule } from "@/features/courses/types/public-course-curriculum.types";
import {
  PUBLIC_CACHE_REVALIDATE_SECONDS,
  PUBLIC_CACHE_TAGS,
} from "@/features/seo/constants/public-cache.constants";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

const getCachedPublicCourseCurriculum = unstable_cache(async function getCachedPublicCourseCurriculum(
  courseId: string,
): Promise<PublicCourseCurriculumModule[]> {
  const client = createPublicSupabaseClient();
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
}, ["public-course-curriculum"], {
  revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
  tags: [PUBLIC_CACHE_TAGS.courses],
});

export function getPublicCourseCurriculum(courseId: string) {
  return getCachedPublicCourseCurriculum(courseId);
}
