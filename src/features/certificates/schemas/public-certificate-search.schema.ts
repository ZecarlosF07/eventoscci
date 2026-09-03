import { z } from "zod";

export const publicCertificateSearchItemSchema = z.object({
  access_token: z.uuid(),
  academic_hours: z.number().nullable(),
  certificate_code: z.string(),
  certificate_type: z.enum(["activity", "course"]),
  condition: z.string().nullable(),
  date_text: z.string().nullable(),
  download_available: z.boolean(),
  issued_at: z.string(),
  participant_name: z.string(),
  revocation_reason: z.string().nullable(),
  status: z.enum(["issued", "revoked"]),
  title: z.string(),
});

export const certificateRecommendationContextSchema = z.object({
  source_activity_id: z.uuid(),
  source_activity_type: z.enum(["event", "training"]),
  source_category_id: z.uuid().nullable(),
});

export const publicCertificateSearchResultSchema = z.object({
  certificates: z.array(publicCertificateSearchItemSchema),
  participant_name: z.string().nullable(),
  recommendation_context: certificateRecommendationContextSchema.nullable(),
  status: z.enum(["found", "invalid", "not_found", "rate_limited"]),
});

export const publicCertificateDniSchema = z.string().trim().regex(
  /^[0-9]{8}$/,
  "El DNI debe tener exactamente 8 dígitos.",
);
