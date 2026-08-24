import "server-only";

import { courseRatingSchema } from "@/features/ratings/schemas/rating.schema";
import type { CourseRating } from "@/features/ratings/types/rating.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getMyCourseRating(courseId: string): Promise<CourseRating | null> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("get_my_course_rating", { p_course_id: courseId });
  if (error) throw new Error("No fue posible cargar tu valoración.", { cause: error });
  if (!data) return null;
  const parsed = courseRatingSchema.safeParse(data);
  if (!parsed.success) throw new Error("Supabase devolvió una valoración inválida.");
  return {
    comment: parsed.data.comment,
    courseId: parsed.data.course_id,
    createdAt: parsed.data.created_at,
    enrollmentId: parsed.data.enrollment_id,
    id: parsed.data.id,
    rating: parsed.data.rating,
    updatedAt: parsed.data.updated_at,
  };
}
