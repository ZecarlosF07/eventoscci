import "server-only";

import {
  IMAGE_MIME_EXTENSIONS,
  MAX_FORM_IMAGE_SIZE,
} from "@/features/media/constants/image-upload.constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const STAGED_IMAGE_PATTERN = /^staging\/[0-9a-f-]{36}\.(jpg|png|webp)$/;

export async function consumeStagedImage(
  bucket: string,
  stagedPath: string,
  destinationPrefix: string,
): Promise<string> {
  if (!STAGED_IMAGE_PATTERN.test(stagedPath)) throw new Error("La referencia de la imagen no es válida.");
  const filename = stagedPath.slice("staging/".length);
  const destination = `${destinationPrefix}/${filename}`;
  const client = await createServerSupabaseClient();
  const storage = client.storage.from(bucket);
  const { data: files, error: inspectionError } = await storage.list("staging", { limit: 1, search: filename });
  const stagedFile = files?.find((file) => file.name === filename);
  if (inspectionError || !stagedFile) throw new Error("La imagen temporal ya no está disponible. Vuelve a seleccionarla.");
  const mimeType = String(stagedFile.metadata?.mimetype ?? "");
  const size = Number(stagedFile.metadata?.size ?? 0);
  if (!IMAGE_MIME_EXTENSIONS[mimeType]) throw new Error("La imagen debe ser JPG, PNG o WebP.");
  if (!Number.isFinite(size) || size <= 0 || size > MAX_FORM_IMAGE_SIZE) {
    throw new Error("La imagen no debe superar 5 MB.");
  }
  const { error } = await storage.move(stagedPath, destination);
  if (error) throw new Error("No fue posible guardar la imagen. Vuelve a seleccionarla e inténtalo nuevamente.", { cause: error });
  return destination;
}

