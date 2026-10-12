import "server-only";

import {
  COURSE_MATERIAL_BUCKET,
  COURSE_MATERIAL_MIME_EXTENSIONS,
} from "@/features/courses/constants/course.constants";
import type { ConsumedCourseMaterial } from "@/features/courses/types/course-content.types";
import { validateCourseMaterialFile } from "@/features/courses/utils/course-material-file-validation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const STAGED_MATERIAL_PATTERN = /^staging\/[0-9a-f-]{36}\.[a-z0-9]+$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function consumeStagedCourseMaterial(
  stagedPath: string,
  courseId: string,
): Promise<ConsumedCourseMaterial> {
  if (!STAGED_MATERIAL_PATTERN.test(stagedPath)) throw new Error("La referencia del archivo no es válida.");
  if (!UUID_PATTERN.test(courseId)) throw new Error("El curso seleccionado no es válido.");
  const filename = stagedPath.slice("staging/".length);
  const client = await createServerSupabaseClient();
  const storage = client.storage.from(COURSE_MATERIAL_BUCKET);
  const { data: files, error: inspectionError } = await storage.list("staging", { limit: 1, search: filename });
  const stagedFile = files?.find((file) => file.name === filename);
  if (inspectionError || !stagedFile) throw new Error("El archivo temporal ya no está disponible. Vuelve a seleccionarlo.");

  const mimeType = String(stagedFile.metadata?.mimetype ?? "");
  const fileSizeBytes = Number(stagedFile.metadata?.size ?? 0);
  const validationError = validateCourseMaterialFile({ size: fileSizeBytes, type: mimeType });
  if (!Number.isFinite(fileSizeBytes) || fileSizeBytes <= 0 || validationError) {
    throw new Error(validationError ?? "El archivo está vacío o no es válido.");
  }
  const expectedExtension = COURSE_MATERIAL_MIME_EXTENSIONS[mimeType];
  if (!filename.endsWith(`.${expectedExtension}`)) throw new Error("La extensión del archivo no coincide con su formato.");

  const storagePath = `${courseId}/${filename}`;
  const { error } = await storage.move(stagedPath, storagePath);
  if (error) throw new Error("No fue posible guardar el archivo. Vuelve a seleccionarlo e inténtalo nuevamente.", { cause: error });
  return { fileSizeBytes, mimeType, storagePath };
}
