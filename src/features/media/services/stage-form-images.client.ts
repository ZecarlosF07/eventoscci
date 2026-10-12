"use client";

import {
  IMAGE_MIME_EXTENSIONS,
} from "@/features/media/constants/image-upload.constants";
import type {
  StagedImageField,
  StageFormImagesResult,
} from "@/features/media/types/staged-image.types";
import { validateFormImage } from "@/features/media/utils/image-file-validation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

function selectedFile(value: FormDataEntryValue | null): File | null {
  return value instanceof File && value.size ? value : null;
}

export async function discardStagedFormImages(bucket: string, paths: string[]): Promise<void> {
  if (!paths.length) return;
  const { error } = await createBrowserSupabaseClient().storage.from(bucket).remove(paths);
  if (error) console.warn("No fue posible limpiar imágenes temporales.");
}

export async function stageFormImages(
  formData: FormData,
  bucket: string,
  fields: StagedImageField[],
): Promise<StageFormImagesResult> {
  const selections = fields.map((field) => ({ ...field, file: selectedFile(formData.get(field.field)) }));
  const errors: Record<string, string[]> = {};

  for (const selection of selections) {
    formData.delete(selection.field);
    if (!selection.file) continue;
    const error = validateFormImage(selection.file, selection.label);
    if (error) errors[selection.field] = [error];
  }
  if (Object.keys(errors).length) return { errors, ok: false };

  const paths: string[] = [];
  const storage = createBrowserSupabaseClient().storage.from(bucket);
  for (const selection of selections) {
    if (!selection.file) continue;
    const extension = IMAGE_MIME_EXTENSIONS[selection.file.type];
    const path = `staging/${crypto.randomUUID()}.${extension}`;
    const { error } = await storage.upload(path, selection.file, {
      cacheControl: "3600",
      contentType: selection.file.type,
      upsert: false,
    });
    if (error) {
      await discardStagedFormImages(bucket, paths);
      return {
        errors: { [selection.field]: ["No fue posible subir la imagen. Verifica tu conexión e inténtalo nuevamente."] },
        ok: false,
      };
    }
    paths.push(path);
    formData.set(selection.stagedField, path);
  }
  return { formData, ok: true, paths };
}

