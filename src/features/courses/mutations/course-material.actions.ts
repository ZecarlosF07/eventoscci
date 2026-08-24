"use server";

import { revalidatePath } from "next/cache";

import { COURSE_MATERIAL_BUCKET } from "@/features/courses/constants/course.constants";
import { MAX_COURSE_MATERIAL_SIZE } from "@/features/courses/constants/course.constants";
import { deleteCourseContentSchema, materialMetadataSchema } from "@/features/courses/schemas/course-content.schema";
import type { MaterialFormState, MaterialMetadataInput } from "@/features/courses/types/course-content.types";
import { getAdminCourseMaterialsRoute } from "@/features/courses/utils/course-routes";
import { requireAdmin } from "@/features/auth/services/admin-session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function saveMaterialMetadataAction(input: MaterialMetadataInput): Promise<MaterialFormState> {
  await requireAdmin();
  const parsed = materialMetadataSchema.safeParse(input);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const client = await createServerSupabaseClient();
  const payload = {
    course_id: parsed.data.courseId,
    description: parsed.data.description || null,
    external_url: parsed.data.materialType === "external_link" ? parsed.data.externalUrl : null,
    file_size_bytes: parsed.data.fileSizeBytes,
    material_type: parsed.data.materialType,
    mime_type: parsed.data.mimeType || null,
    sort_order: parsed.data.sortOrder,
    storage_path: parsed.data.materialType === "file" ? parsed.data.storagePath : null,
    title: parsed.data.title,
  };
  const request = parsed.data.materialId
    ? client.from("course_materials").update(payload).eq("id", parsed.data.materialId)
    : client.from("course_materials").insert(payload);
  const { error } = await request;
  if (error) return { message: "No fue posible guardar el material." };
  revalidatePath(getAdminCourseMaterialsRoute(parsed.data.courseId));
  return { message: "Material guardado.", success: true };
}

export async function saveMaterialAction(
  _previousState: MaterialFormState,
  formData: FormData,
): Promise<MaterialFormState> {
  await requireAdmin();
  const courseId = String(formData.get("course_id") ?? "");
  const materialId = String(formData.get("material_id") ?? "");
  const materialType = String(formData.get("material_type") ?? "external_link") as MaterialMetadataInput["materialType"];
  const existingPath = String(formData.get("storage_path") ?? "");
  const file = formData.get("file");
  let storagePath = existingPath;
  let mimeType = String(formData.get("mime_type") ?? "");
  let fileSizeBytes = Number(formData.get("file_size_bytes") || 0) || null;
  const client = await createServerSupabaseClient();

  if (materialType === "file" && file instanceof File && file.size) {
    if (file.size > MAX_COURSE_MATERIAL_SIZE) return { errors: { file: ["El archivo no debe superar 50 MB."] } };
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    storagePath = `${courseId}/${crypto.randomUUID()}.${extension}`;
    const { error } = await client.storage.from(COURSE_MATERIAL_BUCKET)
      .upload(storagePath, file, { contentType: file.type, upsert: false });
    if (error) return { message: "No fue posible subir el archivo." };
    mimeType = file.type;
    fileSizeBytes = file.size;
  }

  const result = await saveMaterialMetadataAction({
    courseId,
    description: String(formData.get("description") ?? ""),
    externalUrl: String(formData.get("external_url") ?? ""),
    fileSizeBytes,
    materialId,
    materialType,
    mimeType,
    sortOrder: Number(formData.get("sort_order") || 0),
    storagePath,
    title: String(formData.get("title") ?? ""),
  });
  if (!result.success && storagePath !== existingPath) await client.storage.from(COURSE_MATERIAL_BUCKET).remove([storagePath]);
  return result;
}

export async function deleteMaterialAction(courseId: string, id: string): Promise<void> {
  const account = await requireAdmin();
  const parsed = deleteCourseContentSchema.parse({ courseId, id });
  const client = await createServerSupabaseClient();
  const { data, error: readError } = await client.from("course_materials")
    .select("storage_path").eq("id", parsed.id).maybeSingle();
  if (readError) throw new Error("No fue posible consultar el material.", { cause: readError });
  const { error } = await client.from("course_materials").update({
    deleted_at: new Date().toISOString(),
    deleted_by: account.userId,
  }).eq("id", parsed.id);
  if (error) throw new Error("No fue posible eliminar el material.", { cause: error });
  if (data?.storage_path) await client.storage.from(COURSE_MATERIAL_BUCKET).remove([data.storage_path]);
  revalidatePath(getAdminCourseMaterialsRoute(parsed.courseId));
}
