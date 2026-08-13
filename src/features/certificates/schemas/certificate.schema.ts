import { z } from "zod";

export const certificatePublicSchema = z.object({
  academic_hours: z.number().nullable(),
  certificate_code: z.string(),
  condition: z.string().nullable(),
  date_text: z.string().nullable(),
  download_available: z.boolean(),
  issued_at: z.string(),
  participant_name: z.string(),
  revocation_reason: z.string().nullable(),
  revoked_at: z.string().nullable(),
  status: z.enum(["issued", "revoked"]),
  title: z.string(),
});

export const certificateTemplateFormSchema = z.object({
  id: z.string().trim(),
  is_active: z.boolean(),
  is_default: z.boolean(),
  name: z.string().trim().min(3, "Ingresa un nombre.").max(150),
  scope: z.enum(["activity", "course"]),
  show_date: z.boolean(),
});

export const certificateSignerFormSchema = z.object({
  existing_signature_path: z.string().trim(),
  signer_name: z.string().trim().min(3, "Ingresa el nombre del firmante.").max(200),
  signer_title: z.string().trim().max(200),
  sort_order: z.number().int().min(0).max(3),
});
