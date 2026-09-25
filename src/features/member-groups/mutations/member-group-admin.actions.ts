"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/features/auth/services/admin-session";
import type { MemberBillingInput } from "@/features/member-groups/types/member-group.types";
import { deliverNotificationImmediately } from "@/features/notifications/services/process-notifications";
import { PUBLIC_CACHE_TAGS } from "@/features/seo/constants/public-cache.constants";
import type { Json } from "@/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const id = z.uuid();
const paymentSchema = z.object({
  requestId: id, registrationIds: z.array(id).min(1).max(500),
  reference: z.string().trim().min(2).max(150), note: z.string().trim().max(500),
  receivedAmount: z.number().positive(),
  idempotencyKey: id,
});
const billingSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("boleta"), document: z.string().regex(/^\d{8}$/), name: z.string().trim().min(2).max(250), address: z.string().optional() }),
  z.object({ type: z.literal("factura"), document: z.string().regex(/^\d{11}$/), name: z.string().trim().min(2).max(250), address: z.string().trim().min(2).max(250) }),
]);

function refreshGroup(requestId: string) {
  revalidatePath("/admin/inscripciones/solicitudes");
  revalidatePath(`/admin/inscripciones/solicitudes/${requestId}`);
  revalidatePath("/admin/inscripciones/pendientes");
  revalidatePath("/admin/inscripciones");
  updateTag(PUBLIC_CACHE_TAGS.availability);
}

export async function verifyMemberGroupPaymentAction(input: z.input<typeof paymentSchema>): Promise<{ success: boolean; message: string }> {
  await requireAdmin();
  const parsed = paymentSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "Selecciona plazas pendientes y completa la referencia de pago." };
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("verify_member_group_payment", {
    p_request_id: parsed.data.requestId,
    p_registration_ids: parsed.data.registrationIds,
    p_payment_reference: parsed.data.reference,
    p_received_amount: parsed.data.receivedAmount,
    p_note: parsed.data.note,
    p_idempotency_key: parsed.data.idempotencyKey,
  });
  if (error) return { success: false, message: error.message.includes("INVALID_PAYMENT_SELECTION")
    ? "Una plaza ya fue confirmada o cancelada por otro operador. Actualiza la página y revisa la selección."
    : error.message.includes("PAYMENT_AMOUNT_MISMATCH") ? "El importe recibido no coincide con la suma de las plazas seleccionadas. Revisa el pago antes de confirmar."
    : "No se pudo validar el pago. Puedes reintentar sin duplicarlo." };
  const result = z.object({ replayed: z.boolean() }).safeParse(data);
  if (!result.success) return { success: false, message: "La operación se guardó, pero no se pudo confirmar el resultado. Actualiza la página." };
  if (!result.data.replayed) await Promise.all(parsed.data.registrationIds.map((registrationId) => deliverNotificationImmediately({
    eventType: "activity_paid_registration_confirmed", relatedEntityId: registrationId, relatedEntityType: "registration",
  })));
  refreshGroup(parsed.data.requestId);
  return { success: true, message: result.data.replayed ? "Este pago ya estaba registrado." : "Pago validado y plazas seleccionadas confirmadas." };
}

export async function cancelMemberGroupSeatAction(requestId: string, registrationId: string, reason: string): Promise<{ success: boolean; message: string }> {
  await requireAdmin();
  if (!id.safeParse(requestId).success || !id.safeParse(registrationId).success || reason.trim().length < 2 || reason.length > 500) {
    return { success: false, message: "Indica un motivo de cancelación de al menos dos caracteres." };
  }
  const client = await createServerSupabaseClient();
  const { data: seat, error: seatError } = await client.from("registrations")
    .select("id, is_complimentary").eq("id", registrationId).eq("member_group_request_id", requestId).maybeSingle();
  if (seatError || !seat) return { success: false, message: "La plaza no pertenece a esta solicitud." };
  const { error } = await client.rpc("cancel_registration", { p_registration_id: registrationId, p_reason: reason.trim() });
  if (error) return { success: false, message: "No se puede cancelar una plaza pagada. Actualiza el detalle y revisa su estado." };
  if (seat.is_complimentary) await deliverNotificationImmediately({
    eventType: "activity_registration_cancelled", relatedEntityId: registrationId,
    relatedEntityType: "registration",
  });
  refreshGroup(requestId);
  return { success: true, message: seat.is_complimentary
    ? "Plaza cancelada. El pase sigue utilizado; puedes transferirlo a otra plaza pendiente del mismo RUC."
    : "Plaza cancelada y cupo liberado." };
}

export async function transferMemberPassAction(requestId: string, passId: string, targetId: string, reason: string): Promise<{ success: boolean; message: string }> {
  await requireAdmin();
  if (![requestId, passId, targetId].every((value) => id.safeParse(value).success)
    || reason.trim().length < 2 || reason.length > 500) {
    return { success: false, message: "Selecciona una plaza e indica un motivo de al menos dos caracteres." };
  }
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("transfer_member_complimentary_pass", {
    p_pass_id: passId, p_target_registration_id: targetId, p_reason: reason.trim(),
  });
  if (error) return { success: false, message: "No se pudo transferir el pase. Comprueba que la plaza siga pendiente, sin pago ni asistencia." };
  const parsed = z.object({ target_registration_id: id }).safeParse(data);
  if (!parsed.success) return { success: false, message: "Se registró la transferencia; actualiza la página para comprobarla." };
  await deliverNotificationImmediately({
    eventType: "activity_free_registration_confirmed", relatedEntityId: parsed.data.target_registration_id,
    relatedEntityType: "registration",
  });
  refreshGroup(requestId);
  return { success: true, message: "Pase transferido. La nueva plaza quedó confirmada sin pago." };
}

export async function correctMemberGroupBillingAction(requestId: string, billing: MemberBillingInput, reason: string): Promise<{ success: boolean; message: string }> {
  await requireAdmin();
  const parsed = billingSchema.safeParse(billing);
  if (!id.safeParse(requestId).success || !parsed.success || reason.trim().length < 2 || reason.length > 500) {
    return { success: false, message: "Revisa los datos del comprobante y escribe el motivo de la corrección." };
  }
  const client = await createServerSupabaseClient();
  const { error } = await client.rpc("correct_member_group_billing", {
    p_request_id: requestId, p_billing: parsed.data as unknown as Json, p_reason: reason.trim(),
  });
  if (error) return { success: false, message: "No se pudo corregir el comprobante solicitado." };
  refreshGroup(requestId);
  return { success: true, message: "Datos corregidos y cambio registrado en auditoría." };
}
