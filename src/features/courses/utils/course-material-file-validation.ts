import {
  COURSE_MATERIAL_MIME_EXTENSIONS,
  MAX_COURSE_MATERIAL_SIZE,
  MAX_COURSE_MATERIAL_SIZE_LABEL,
} from "@/features/courses/constants/course.constants";
import { formatMegabytes } from "@/features/media/utils/file-size";

interface CourseMaterialFileMetadata {
  size: number;
  type: string;
}

export function validateCourseMaterialFile(file: CourseMaterialFileMetadata): string | null {
  const label = file.type.startsWith("image/") ? "La imagen" : "El archivo";
  if (!COURSE_MATERIAL_MIME_EXTENSIONS[file.type]) {
    return file.type.startsWith("image/")
      ? "La imagen debe ser JPG, PNG o WebP."
      : "El tipo de archivo seleccionado no está permitido.";
  }
  if (file.size > MAX_COURSE_MATERIAL_SIZE) {
    return `${label} pesa ${formatMegabytes(file.size)}. El máximo permitido es ${MAX_COURSE_MATERIAL_SIZE_LABEL}.`;
  }
  return null;
}
