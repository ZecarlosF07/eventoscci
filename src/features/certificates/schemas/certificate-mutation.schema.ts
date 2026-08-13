import { z } from "zod";

export const prepareCertificateResultSchema = z.object({
  existing: z.array(z.object({
    certificate_id: z.uuid(),
    file_ready: z.boolean(),
    registration_id: z.uuid(),
  })),
  prepared: z.array(z.object({
    certificate_id: z.uuid(),
    registration_id: z.uuid(),
  })),
  rejected: z.array(z.object({
    reason: z.string(),
    registration_id: z.uuid(),
  })),
});
