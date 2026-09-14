import { ACTIVITY_IMAGE_BUCKET } from "@/features/activities/constants/activity.constants";
import type { ActivityMediaInput } from "@/features/activities/types/activity-media.types";
import type { TypedSupabaseClient } from "@/lib/supabase/types/supabase-client.types";

function destinationPath(stagedPath: string, activityId: string, directory?: string): string {
  const extension = stagedPath.split(".").pop() ?? "jpg";
  const prefix = directory ? `${activityId}/${directory}` : activityId;
  return `${prefix}/${crypto.randomUUID()}.${extension}`;
}

async function moveImage(client: TypedSupabaseClient, source: string, destination: string): Promise<void> {
  const { error } = await client.storage.from(ACTIVITY_IMAGE_BUCKET).move(source, destination);
  if (error) throw new Error("La actividad se guardó, pero una imagen no pudo asociarse. Inténtalo nuevamente al editarla.", { cause: error });
}

export async function syncActivityMediaWithClient(
  client: TypedSupabaseClient,
  input: ActivityMediaInput,
  activityId: string,
): Promise<void> {
  const currentResult = await client.from("activities").select("banner_path, program_image_paths").eq("id", activityId).single();
  if (currentResult.error) throw new Error("La actividad se guardó, pero no fue posible consultar sus imágenes.", { cause: currentResult.error });

  const retainedPaths = input.retainedProgramPaths.filter((path) => currentResult.data.program_image_paths.includes(path));
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
  } catch (uploadError) {
    const cleanupPaths = [...stagedPaths, ...movedPaths];
    if (cleanupPaths.length) await client.storage.from(ACTIVITY_IMAGE_BUCKET).remove(cleanupPaths);
    throw uploadError;
  }

  // Keep previously published files available for open tabs and cached image URLs.
  // Only unsuccessful uploads are removed here; historical assets need a separate cleanup policy.
}
