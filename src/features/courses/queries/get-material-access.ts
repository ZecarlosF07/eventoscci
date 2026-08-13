import "server-only";

import { COURSE_MATERIAL_BUCKET } from "@/features/courses/constants/course.constants";
import type { MaterialAccess } from "@/features/courses/types/course.types";
import { getStudentCourseContent } from "@/features/courses/queries/get-my-courses";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getMaterialAccess(courseId: string, materialId: string): Promise<MaterialAccess | null> {
  const content = await getStudentCourseContent(courseId);
  if (!content) return null;
  const material = content.materials.find((item) => item.id === materialId);
  if (!material) return null;
  if (material.material_type === "external_link" && material.external_url) {
    return { title: material.title, url: material.external_url };
  }
  if (!material.storage_path) return null;
  const client = await createServerSupabaseClient();
  const { data, error } = await client.storage.from(COURSE_MATERIAL_BUCKET)
    .createSignedUrl(material.storage_path, 60 * 10, { download: material.title });
  if (error) throw new Error("No fue posible preparar la descarga.", { cause: error });
  return { title: material.title, url: data.signedUrl };
}
