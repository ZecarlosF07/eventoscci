import { z } from "zod";

export const enrollFreeCourseSchema = z.object({ courseId: z.uuid() });

export const grantCourseAccessSchema = z.object({
  courseId: z.uuid(),
  personId: z.uuid(),
  priceSnapshot: z.number().nonnegative().nullable(),
  registrationType: z.enum(["general", "member"]),
});

export const revokeCourseAccessSchema = z.object({
  courseId: z.uuid(),
  enrollmentId: z.uuid(),
  reason: z.string().trim().min(3, "Indica el motivo de la revocación."),
});
