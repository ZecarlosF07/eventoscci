import { z } from "zod";

export const attendanceActivityOptionSchema = z.object({
  id: z.uuid(),
  registrations: z.array(z.object({ id: z.uuid() })),
  status: z.enum(["draft", "published", "finished", "archived", "cancelled"]),
  title: z.string(),
  type: z.enum(["event", "training"]),
});

export const attendanceRegistrationSchema = z.object({
  attendance: z.array(z.object({
    id: z.uuid(),
    marked_at: z.string().nullable(),
    notes: z.string().nullable(),
    status: z.enum(["pending", "attended", "absent"]),
  })),
  company_snapshot: z.string().nullable(),
  id: z.uuid(),
  person: z.object({
    document_number: z.string(),
    email: z.string(),
    first_names: z.string(),
    last_names: z.string(),
  }),
  registration_code: z.string(),
  registration_type: z.enum(["general", "member"]),
  status: z.enum(["pending", "confirmed", "cancelled"]),
});
