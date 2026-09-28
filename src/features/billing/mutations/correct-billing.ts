"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/features/auth/services/admin-session";
import { billingSchema } from "@/features/billing/schemas/billing.schema";
import type { BillingCorrectionInput } from "@/features/billing/types/billing.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const correctionSchema = z.object({ kind: z.enum(["individual", "group"]), id: z.uuid(), billing: billingSchema, reason: z.string().trim().min(2).max(500) });
export async function correctBilling(input: BillingCorrectionInput) {
  await requireAdmin();
  const parsed = correctionSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Revisa los datos y escribe un motivo de al menos dos caracteres." };
  const client = await createServerSupabaseClient();
  const { error } = await client.rpc("correct_participation_billing", {
    p_kind: parsed.data.kind, p_request_id: parsed.data.id, p_billing: parsed.data.billing, p_reason: parsed.data.reason,
  });
  if (error) return { success: false, message: "No se pudo guardar la corrección. Actualiza y verifica que la solicitud conserve datos de comprobante." };
  revalidatePath("/admin/inscripciones", "layout");
  return { success: true, message: "Datos corregidos. El motivo y los valores anteriores quedaron registrados en auditoría." };
}
