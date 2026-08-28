import "server-only";

import { ACTIVITY_IMAGE_BUCKET } from "@/features/activities/constants/activity.constants";
import type {
  ActivityMediaErrors,
  ActivityMediaInput,
} from "@/features/activities/types/activity-media.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/supabase-error";

const ACTIVITY_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_PROGRAM_IMAGES = 10;

function selectedFile(value: FormDataEntryValue | null): File | null {
  return value instanceof File && value.size ? value : null;
}

export function getActivityMediaInput(formData: FormData): ActivityMediaInput {
  return {
    banner: selectedFile(formData.get("banner")),
    programImages: formData.getAll("program_images").map(selectedFile).filter((file): file is File => Boolean(file)),
    retainedProgramPaths: formData.getAll("program_image_paths").map(String),
  };
}

function validateImage(file: File, label: string): string | null {
  if (!ACTIVITY_IMAGE_TYPES.includes(file.type)) return `${label} debe ser JPG, PNG o WebP.`;
  if (file.size > MAX_IMAGE_SIZE) return `${label} no debe superar 5 MB.`;
  return null;
}

export function validateActivityMedia(input: ActivityMediaInput): Partial<ActivityMediaErrors> {
  const bannerError = input.banner ? validateImage(input.banner, "El banner") : null;
  const programError = input.programImages
    .map((file) => validateImage(file, "Cada imagen del programa"))
    .find(Boolean);
  if (bannerError) return { banner: [bannerError] };
  if (programError) return { program_images: [programError] };
  if (input.retainedProgramPaths.length + input.programImages.length > MAX_PROGRAM_IMAGES) {
    return { program_images: [`El programa admite como máximo ${MAX_PROGRAM_IMAGES} imágenes.`] };
  }
  return {};
}

async function uploadImage(file: File, activityId: string, directory?: string): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const prefix = directory ? `${activityId}/${directory}` : activityId;
  const path = `${prefix}/${crypto.randomUUID()}.${extension}`;
  const client = await createServerSupabaseClient();
  const { error } = await client.storage.from(ACTIVITY_IMAGE_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (!error) return path;

  logSupabaseError("activity_image_upload_failed", error, { activityId, directory });
  throw new Error(getSupabaseErrorMessage(error, {
    fallback: "La actividad se guardó, pero una imagen no pudo cargarse. Puedes volver a intentarlo al editarla.",
    messages: {
      "BUCKET NOT FOUND": "El almacenamiento de imágenes no está disponible. Comunícate con el administrador.",
      "MIME TYPE": "El formato de una imagen no está permitido. Usa JPG, PNG o WebP.",
      "PAYLOAD TOO LARGE": "Una imagen supera el tamaño permitido de 5 MB.",
    },
  }));
}

export async function syncActivityMedia(input: ActivityMediaInput, activityId: string): Promise<void> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client.from("activities").select("program_image_paths").eq("id", activityId).single();
  if (error) throw new Error("La actividad se guardó, pero no fue posible consultar sus imágenes.", { cause: error });

  const currentPaths = data.program_image_paths ?? [];
  const retainedPaths = input.retainedProgramPaths.filter((path) => currentPaths.includes(path));
  const removedPaths = currentPaths.filter((path) => !retainedPaths.includes(path));
  const uploadedPaths: string[] = [];
  const newProgramPaths: string[] = [];

  try {
    const bannerPath = input.banner ? await uploadImage(input.banner, activityId) : null;
    if (bannerPath) uploadedPaths.push(bannerPath);
    for (const file of input.programImages) {
      const path = await uploadImage(file, activityId, "program");
      newProgramPaths.push(path);
      uploadedPaths.push(path);
    }
    const mediaUpdate = {
      ...(bannerPath ? { banner_path: bannerPath } : {}),
      program_image_paths: [...retainedPaths, ...newProgramPaths],
    };
    const { error: updateError } = await client.from("activities").update(mediaUpdate).eq("id", activityId);
    if (updateError) throw new Error("La actividad se guardó, pero las imágenes no pudieron asociarse.", { cause: updateError });
  } catch (uploadError) {
    if (uploadedPaths.length) {
      const { error: cleanupError } = await client.storage.from(ACTIVITY_IMAGE_BUCKET).remove(uploadedPaths);
      if (cleanupError) logSupabaseError("activity_image_cleanup_failed", cleanupError, { activityId });
    }
    throw uploadError;
  }

  if (removedPaths.length) {
    const { error: removalError } = await client.storage.from(ACTIVITY_IMAGE_BUCKET).remove(removedPaths);
    if (removalError) logSupabaseError("activity_program_removal_failed", removalError, { activityId });
  }
}
