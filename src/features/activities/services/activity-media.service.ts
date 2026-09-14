import "server-only";

import { syncActivityMediaWithClient } from "@/features/activities/services/sync-activity-media";
import type { ActivityMediaErrors, ActivityMediaInput } from "@/features/activities/types/activity-media.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const MAX_PROGRAM_IMAGES = 10;
const STAGED_IMAGE_PATTERN = /^staging\/[0-9a-f-]{36}\.(?:jpg|png|webp)$/;

export function getActivityMediaInput(formData: FormData): ActivityMediaInput {
  return {
    bannerStagedPath: String(formData.get("banner_staged_path") ?? "") || null,
    programStagedPaths: formData.getAll("program_staged_paths").map(String),
    retainedProgramPaths: formData.getAll("program_image_paths").map(String),
  };
}

export function validateActivityMedia(input: ActivityMediaInput): Partial<ActivityMediaErrors> {
  if (input.bannerStagedPath && !STAGED_IMAGE_PATTERN.test(input.bannerStagedPath)) {
    return { banner: ["La carga temporal del banner no es válida."] };
  }
  if (input.programStagedPaths.some((path) => !STAGED_IMAGE_PATTERN.test(path))) {
    return { program_images: ["Una carga temporal del programa no es válida."] };
  }
  if (input.retainedProgramPaths.length + input.programStagedPaths.length > MAX_PROGRAM_IMAGES) {
    return { program_images: [`El programa admite como máximo ${MAX_PROGRAM_IMAGES} imágenes.`] };
  }
  return {};
}

export async function syncActivityMedia(input: ActivityMediaInput, activityId: string): Promise<void> {
  await syncActivityMediaWithClient(await createServerSupabaseClient(), input, activityId);
}
