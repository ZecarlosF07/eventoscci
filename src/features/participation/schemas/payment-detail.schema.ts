import { z } from "zod";

export const paymentSeatSchema = z.object({
  id: z.uuid(), firstNames: z.string(), lastNames: z.string(), price: z.number().nonnegative(),
  status: z.enum(["pending", "confirmed", "cancelled"]), isComplimentary: z.boolean(),
});
export const paymentDetailSchema = z.object({
  request: z.object({
    id: z.uuid(), kind: z.enum(["individual", "group"]), code: z.string(), name: z.string(),
    companyRuc: z.string().nullable(), pendingCount: z.number().int().nonnegative(),
    pendingAmount: z.number().nonnegative(), validatedAmount: z.number().nonnegative(), legacyAmount: z.number().nonnegative(),
  }),
  attendees: z.array(paymentSeatSchema),
  payments: z.array(z.object({
    id: z.uuid(), amount: z.number().nonnegative(), reference: z.string(), note: z.string().nullable(),
    verifiedAt: z.string(), verifiedByName: z.string(), seats: z.array(z.string()),
  })),
});
