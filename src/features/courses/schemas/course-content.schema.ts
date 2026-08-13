import { z } from "zod";

export const moduleFormSchema = z.object({
  courseId: z.uuid(),
  description: z.string().trim(),
  id: z.union([z.uuid(), z.literal("")]),
  isPublished: z.boolean(),
  sortOrder: z.number().int().nonnegative(),
  title: z.string().trim().min(3, "El título debe tener al menos 3 caracteres."),
});

export const lessonFormSchema = z.object({
  courseId: z.uuid(),
  description: z.string().trim(),
  durationSeconds: z.number().int().positive().nullable(),
  id: z.union([z.uuid(), z.literal("")]),
  isPublished: z.boolean(),
  isRequired: z.boolean(),
  moduleId: z.uuid(),
  sortOrder: z.number().int().nonnegative(),
  title: z.string().trim().min(3, "El título debe tener al menos 3 caracteres."),
  videoAssetId: z.string().trim(),
  videoProvider: z.enum(["youtube", "vimeo", "external", "supabase"]),
  videoStoragePath: z.string().trim(),
}).superRefine((data, context) => {
  if (data.videoProvider !== "supabase" && !data.videoAssetId) {
    context.addIssue({ code: "custom", message: "Indica el identificador o URL del video.", path: ["videoAssetId"] });
  }
  if (data.videoProvider === "external" && !data.videoAssetId.startsWith("https://")) {
    context.addIssue({ code: "custom", message: "Usa una URL HTTPS válida.", path: ["videoAssetId"] });
  }
  if (data.videoProvider === "supabase" && !data.videoStoragePath) {
    context.addIssue({ code: "custom", message: "Indica la ruta del video en Storage.", path: ["videoStoragePath"] });
  }
});

export const materialMetadataSchema = z.object({
  courseId: z.uuid(),
  description: z.string().trim(),
  externalUrl: z.string().trim(),
  fileSizeBytes: z.number().int().nonnegative().nullable(),
  materialId: z.union([z.uuid(), z.literal("")]),
  materialType: z.enum(["file", "external_link"]),
  mimeType: z.string().trim(),
  sortOrder: z.number().int().nonnegative(),
  storagePath: z.string().trim(),
  title: z.string().trim().min(3, "El título debe tener al menos 3 caracteres."),
}).superRefine((data, context) => {
  if (data.materialType === "file" && !data.storagePath) {
    context.addIssue({ code: "custom", message: "Sube un archivo para continuar.", path: ["storagePath"] });
  }
  if (data.materialType === "external_link" && !data.externalUrl.startsWith("https://")) {
    context.addIssue({ code: "custom", message: "Usa una URL HTTPS válida.", path: ["externalUrl"] });
  }
});

export const deleteCourseContentSchema = z.object({
  courseId: z.uuid(),
  id: z.uuid(),
});
