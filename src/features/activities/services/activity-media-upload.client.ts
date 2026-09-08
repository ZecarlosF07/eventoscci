"use client";

import { ACTIVITY_IMAGE_BUCKET } from "@/features/activities/constants/activity.constants";
import type { ActivityMediaErrors, ActivityMediaUploadProgress, ActivityMediaUploadResult } from "@/features/activities/types/activity-media.types";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_PROGRAM_IMAGES = 10;

function selectedFile(value: FormDataEntryValue | null): File | null {
  return value instanceof File && value.size ? value : null;
}

function validateFile(file: File, label: string): string | null {
  if (!MIME_EXTENSIONS[file.type]) return `${label} debe ser JPG, PNG o WebP.`;
  if (file.size > MAX_IMAGE_SIZE) return `${label} no debe superar 5 MB.`;
  return null;
}

function validateSelection(banner: File | null, programs: File[], retainedCount: number): Partial<ActivityMediaErrors> {
  const bannerError = banner ? validateFile(banner, "El banner") : null;
  const programError = programs.map((file) => validateFile(file, "Cada imagen del programa")).find(Boolean);
  if (bannerError) return { banner: [bannerError] };
  if (programError) return { program_images: [programError] };
  if (retainedCount + programs.length > MAX_PROGRAM_IMAGES) {
    return { program_images: [`El programa admite como máximo ${MAX_PROGRAM_IMAGES} imágenes.`] };
  }
  return {};
}

export async function discardStagedActivityMedia(paths: string[]): Promise<void> {
  if (!paths.length) return;
  const { error } = await createBrowserSupabaseClient().storage.from(ACTIVITY_IMAGE_BUCKET).remove(paths);
  if (error) console.warn("No fue posible limpiar imágenes temporales.");
}

export async function stageActivityMedia(
  formData: FormData,
  onProgress: (progress: ActivityMediaUploadProgress) => void,
): Promise<ActivityMediaUploadResult> {
  const banner = selectedFile(formData.get("banner"));
  const programs = formData.getAll("program_images").map(selectedFile).filter((file): file is File => Boolean(file));
  const errors = validateSelection(banner, programs, formData.getAll("program_image_paths").length);
  formData.delete("banner");
  formData.delete("program_images");
  if (Object.keys(errors).length) return { errors, ok: false };

  const uploads = [...(banner ? [{ field: "banner_staged_path", file: banner }] : []), ...programs.map((file) => ({ field: "program_staged_paths", file }))];
  const stagedPaths: string[] = [];
  const bucket = createBrowserSupabaseClient().storage.from(ACTIVITY_IMAGE_BUCKET);
  for (const [index, upload] of uploads.entries()) {
    onProgress({ current: index + 1, total: uploads.length });
    const path = `staging/${crypto.randomUUID()}.${MIME_EXTENSIONS[upload.file.type]}`;
    const { error } = await bucket.upload(path, upload.file, { cacheControl: "3600", contentType: upload.file.type, upsert: false });
    if (error) {
      await discardStagedActivityMedia(stagedPaths);
      return { errors: { [upload.field === "banner_staged_path" ? "banner" : "program_images"]: ["No fue posible subir la imagen. Verifica tu conexión e inténtalo nuevamente."] }, ok: false };
    }
    stagedPaths.push(path);
    formData.append(upload.field, path);
  }
  return { formData, ok: true, stagedPaths };
}
