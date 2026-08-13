import { z } from "zod";

export const currentAccountRowSchema = z.object({
  deleted_at: z.string().nullable(),
  is_active: z.boolean(),
  person: z.object({
    address: z.string().nullable(),
    company: z.string().nullable(),
    document_number: z.string(),
    document_type: z.enum(["dni", "ce"]),
    email: z.string(),
    first_names: z.string(),
    id: z.uuid(),
    job_title: z.string(),
    last_names: z.string(),
    phone: z.string(),
    ruc: z.string().nullable(),
  }),
  role: z.enum(["student", "operator", "administrator"]),
  user_id: z.uuid(),
});
