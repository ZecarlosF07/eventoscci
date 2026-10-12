"use client";

import {
  COURSE_MATERIAL_BUCKET,
  COURSE_MATERIAL_MIME_EXTENSIONS,
} from "@/features/courses/constants/course.constants";
import type { StageCourseMaterialResult } from "@/features/courses/types/course-content.types";
import { validateCourseMaterialFile } from "@/features/courses/utils/course-material-file-validation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export async function discardStagedCourseMaterials(paths: string[]): Promise<void> {
  if (!paths.length) return;
  const { error } = await createBrowserSupabaseClient().storage.from(COURSE_MATERIAL_BUCKET).remove(paths);
  if (error) console.warn("No fue posible limpiar archivos temporales.");
}

export async function stageCourseMaterial(formData: FormData): Promise<StageCourseMaterialResult> {
  const entry = formData.get("file");
  const file = entry instanceof File && entry.size ? entry : null;
  formData.delete("file");

  if (formData.get("material_type") !== "file" || !file) {
    return { formData, ok: true, paths: [] };
  }

  const validationError = validateCourseMaterialFile(file);
  if (validationError) return { errors: { file: [validationError] }, ok: false };

  const extension = COURSE_MATERIAL_MIME_EXTENSIONS[file.type];
  const path = `staging/${crypto.randomUUID()}.${extension}`;
  const { error } = await createBrowserSupabaseClient().storage.from(COURSE_MATERIAL_BUCKET).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    return {
      errors: { file: ["No fue posible subir el archivo. Verifica tu conexión e inténtalo nuevamente."] },
      ok: false,
    };
  }

  formData.set("file_staged_path", path);
  return { formData, ok: true, paths: [path] };
}
