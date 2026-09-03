import { z } from "zod";

export const certificateQueryAuditDataSchema = z.object({
  document_number: z.string(),
  outcome: z.enum(["found", "invalid", "not_found", "rate_limited"]),
  result_count: z.number().int().nonnegative(),
});

export const certificateQueryAuditRowSchema = z.object({
  actor_user_id: z.uuid().nullable(),
  created_at: z.string(),
  id: z.uuid(),
  ip_address: z.unknown(),
  new_data: certificateQueryAuditDataSchema,
  user_agent: z.string().nullable(),
});
