import { z } from "zod";

export const billingDetailSchema = z.object({
  activity_id: z.uuid(), id: z.uuid(), kind: z.enum(["group", "individual"]), code: z.string(), name: z.string(),
  company_name: z.string().nullable(), company_ruc: z.string().nullable(),
  billing_type: z.enum(["boleta", "factura"]).nullable(), billing_document: z.string().nullable(),
  billing_name: z.string().nullable(), billing_address: z.string().nullable(),
  billing_state: z.enum(["provided", "missing", "not_required"]),
  status: z.enum(["pending", "partial", "complete", "cancelled"]),
  participation_amount: z.number().nonnegative(), validated_amount: z.number().nonnegative(),
  pending_amount: z.number().nonnegative(), legacy_amount: z.number().nonnegative(), complimentary_count: z.number().int().nonnegative(),
});
