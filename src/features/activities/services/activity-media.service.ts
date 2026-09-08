import "server-only";

import { ACTIVITY_IMAGE_BUCKET } from "@/features/activities/constants/activity.constants";
import type { ActivityMediaErrors, ActivityMediaInput } from "@/features/activities/types/activity-media.types";
import type { TypedSupabaseClient } from "@/lib/supabase/types/supabase-client.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logSupabaseError } from "@/lib/supabase/supabase-error";

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

function destinationPath(stagedPath: string, activityId: string, directory?: string): string {
  const extension = stagedPath.split(".").pop() ?? "jpg";
  const prefix = directory ? `${activityId}/${directory}` : activityId;
  return `${prefix}/${crypto.randomUUID()}.${extension}`;
}

async function moveImage(client: TypedSupabaseClient, source: string, destination: string): Promise<void> {
  const { error } = await client.storage.from(ACTIVITY_IMAGE_BUCKET).move(source, destination);
  if (error) throw new Error("La actividad se guardó, pero una imagen no pudo asociarse. Inténtalo nuevamente al editarla.", { cause: error });
}

export async function syncActivityMedia(input: ActivityMediaInput, activityId: string): Promise<void> {
  const client = await createServerSupabaseClient();
  const currentResult = await client.from("activities").select("banner_path, program_image_paths").eq("id", activityId).single();
  if (currentResult.error) throw new Error("La actividad se guardó, pero no fue posible consultar sus imágenes.", { cause: currentResult.error });

  const retainedPaths = input.retainedProgramPaths.filter((path) => currentResult.data.program_image_paths.includes(path));
  const removedPaths = currentResult.data.program_image_paths.filter((path) => !retainedPaths.includes(path));
  const movedPaths: string[] = [];
  const stagedPaths = [input.bannerStagedPath, ...input.programStagedPaths].filter((path): path is string => Boolean(path));

  try {
    let bannerPath: string | null = null;
    if (input.bannerStagedPath) {
      bannerPath = destinationPath(input.bannerStagedPath, activityId);
      await moveImage(client, input.bannerStagedPath, bannerPath);
      movedPaths.push(bannerPath);
    }
    const programPaths: string[] = [];
    for (const stagedPath of input.programStagedPaths) {
      const path = destinationPath(stagedPath, activityId, "program");
      await moveImage(client, stagedPath, path);
      movedPaths.push(path);
      programPaths.push(path);
    }
    const updateResult = await client.from("activities").update({
      ...(bannerPath ? { banner_path: bannerPath } : {}),
      program_image_paths: [...retainedPaths, ...programPaths],
    }).eq("id", activityId);
    if (updateResult.error) throw new Error("La actividad se guardó, pero las imágenes no pudieron asociarse.", { cause: updateResult.error });
    if (bannerPath && currentResult.data.banner_path) removedPaths.push(currentResult.data.banner_path);
  } catch (uploadError) {
    const cleanupPaths = [...stagedPaths, ...movedPaths];
    if (cleanupPaths.length) await client.storage.from(ACTIVITY_IMAGE_BUCKET).remove(cleanupPaths);
    throw uploadError;
  }

  if (removedPaths.length) {
    const { error } = await client.storage.from(ACTIVITY_IMAGE_BUCKET).remove(removedPaths);
    if (error) logSupabaseError("activity_image_removal_failed", error, { activityId });
  }
}
