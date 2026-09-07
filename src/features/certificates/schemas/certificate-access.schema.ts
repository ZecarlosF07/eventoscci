import { z } from "zod";

export const certificateAccessTokenSchema = z.uuid();

export const certificateAccessSourceSchema = z.enum(["direct", "email", "public_search"]);

export const certificateViewRequestSchema = z.object({
  source: certificateAccessSourceSchema.default("direct"),
});

export const certificateAccessAuditRowSchema = z.object({
  action: z.enum(["certificate.public_download", "certificate.public_view"]),
  created_at: z.string(),
  entity_id: z.uuid(),
  id: z.uuid(),
  ip_address: z.unknown(),
  new_data: z.object({ source: certificateAccessSourceSchema }).nullable(),
  user_agent: z.string().nullable(),
});

export const certificateAccessCertificateRowSchema = z.object({
  certificate_code: z.string(),
  id: z.uuid(),
  participant_name_snapshot: z.string(),
  person_id: z.uuid(),
  title_snapshot: z.string(),
});
