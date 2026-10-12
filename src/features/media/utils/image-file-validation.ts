import {
  IMAGE_MIME_EXTENSIONS,
  MAX_FORM_IMAGE_SIZE,
  MAX_FORM_IMAGE_SIZE_LABEL,
} from "@/features/media/constants/image-upload.constants";
import { formatMegabytes } from "@/features/media/utils/file-size";

interface ImageFileMetadata {
  size: number;
  type: string;
}

export function validateFormImage(file: ImageFileMetadata, label: string): string | null {
  if (!IMAGE_MIME_EXTENSIONS[file.type]) return `${label} debe ser JPG, PNG o WebP.`;
  if (file.size > MAX_FORM_IMAGE_SIZE) {
    return `${label} pesa ${formatMegabytes(file.size)}. El máximo permitido es ${MAX_FORM_IMAGE_SIZE_LABEL}.`;
  }
  return null;
}

