import { z } from "zod";

export const certificateBatchStatusSchema = z.object({
  activity_id: z.uuid(),
  blocked: z.number(),
  created_at: z.string(),
  email_attention: z.number(),
  errors: z.array(z.object({ reason: z.string().nullable(), registration_id: z.uuid() })),
  id: z.uuid(),
  issued: z.number(),
  pending: z.number(),
  processing: z.number(),
  recoverable: z.number(),
  total: z.number(),
});

export const certificateBatchClaimSchema = z.object({
  condition: z.string(),
  eligible: z.boolean(),
  item_id: z.uuid(),
  lease_token: z.uuid(),
  registration_id: z.uuid(),
  template_id: z.uuid(),
});
