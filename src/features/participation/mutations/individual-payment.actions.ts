"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/features/auth/services/admin-session";
import { deliverNotificationImmediately } from "@/features/notifications/services/process-notifications";
import type { IndividualPaymentInput } from "@/features/participation/types/payment.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const schema = z.object({ registrationId: z.uuid(), receivedAmount: z.number().finite().positive(),
  reference: z.string().trim().min(2).max(150), note: z.string().trim().max(500), idempotencyKey: z.uuid() });
export async function verifyIndividualPaymentAction(input: IndividualPaymentInput): Promise<{ success: boolean; message: string }> {
  await requireAdmin();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Revisa la inscripción y completa una referencia del pago de al menos dos caracteres." };
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("verify_individual_registration_payment", {
    p_registration_id: parsed.data.registrationId, p_received_amount: parsed.data.receivedAmount,
    p_payment_reference: parsed.data.reference, p_note: parsed.data.note, p_idempotency_key: parsed.data.idempotencyKey,
  });
  if (error) return { success: false, message: error.message.includes("PAYMENT_AMOUNT_MISMATCH")
    ? "El precio de la inscripción cambió. Actualiza el detalle y revisa el importe antes de confirmar."
    : error.message.includes("INVALID_PAYMENT_SELECTION") ? "Esta inscripción ya no está pendiente. Actualiza y revisa su estado."
    : "No se pudo validar el pago. Puedes reintentar sin duplicarlo." };
  const result = z.object({ replayed: z.boolean() }).safeParse(data);
  if (!result.success) return { success: false, message: "Actualiza la página para comprobar el resultado guardado." };
  let delivered = true;
  if (!result.data.replayed) delivered = await deliverNotificationImmediately({
    eventType: "activity_paid_registration_confirmed", relatedEntityId: input.registrationId, relatedEntityType: "registration",
  });
  revalidatePath("/admin/inscripciones", "layout");
  revalidatePath("/admin/participantes");
  return { success: true, message: result.data.replayed ? "Este pago ya estaba registrado."
    : delivered ? "Pago registrado e inscripción confirmada." : "Pago registrado. El correo quedó pendiente de reintento en Notificaciones." };
}
