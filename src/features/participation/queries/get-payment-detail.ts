import "server-only";

import { paymentDetailSchema } from "@/features/participation/schemas/payment-detail.schema";
import type { PaymentDetailData } from "@/features/participation/types/payment-detail.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/** Payment-only read: no receipt fields, pass transfers, attendance or certificate histories. */
export async function getPaymentDetail(activityId: string, requestId: string): Promise<PaymentDetailData | null> {
  const client = await createServerSupabaseClient();
  const { data: request, error } = await client.from("participation_payment_requests")
    .select("id, kind, code, name, company_ruc, pending_count, pending_amount, validated_amount, legacy_amount")
    .eq("activity_id", activityId).eq("id", requestId).maybeSingle();
  if (error) throw new Error("No se pudo consultar la solicitud de pago.", { cause: error });
  if (!request) return null;
  const group = request.kind === "group";
  const [seatsResult, paymentsResult] = await Promise.all([
    group ? client.from("registrations")
      .select("id, registration_code, first_names_snapshot, last_names_snapshot, price_snapshot, status, is_complimentary, person:people!inner(deleted_at)")
      .eq("activity_id", activityId).eq("member_group_request_id", requestId).is("deleted_at", null)
      .is("person.deleted_at", null).order("created_at").order("id") : Promise.resolve({ data: [], error: null }),
    group ? client.from("member_group_payments").select("id, amount, payment_reference, note, verified_at, verified_by")
      .eq("request_id", requestId).order("verified_at", { ascending: false })
      : client.from("individual_registration_payments").select("id, amount, payment_reference, note, verified_at, verified_by")
        .eq("registration_id", requestId).order("verified_at", { ascending: false }),
  ]);
  if (seatsResult.error || paymentsResult.error) throw new Error("No se pudieron consultar las plazas y los pagos.");
  const seats = seatsResult.data ?? [];
  const payments = paymentsResult.data ?? [];
  const paymentIds = payments.map((payment) => payment.id);
  const actorIds = [...new Set(payments.flatMap((payment) => payment.verified_by ? [payment.verified_by] : []))];
  const [allocationsResult, actorsResult] = await Promise.all([
    group && paymentIds.length ? client.from("member_group_payment_allocations").select("payment_id, registration_id")
      .in("payment_id", paymentIds) : Promise.resolve({ data: [], error: null }),
    actorIds.length ? client.from("user_accounts").select("user_id, person:people!inner(first_names, last_names)")
      .in("user_id", actorIds) : Promise.resolve({ data: [], error: null }),
  ]);
  if (allocationsResult.error || actorsResult.error) throw new Error("No se pudo consultar el historial del pago.");
  const codes = new Map(seats.map((seat) => [seat.id, seat.registration_code]));
  const names = new Map((actorsResult.data ?? []).map((actor) => [actor.user_id, `${actor.person.first_names} ${actor.person.last_names}`]));
  return paymentDetailSchema.parse({
    request: { id: request.id, kind: request.kind, code: request.code, name: request.name, companyRuc: request.company_ruc,
      pendingCount: request.pending_count ?? 0, pendingAmount: request.pending_amount ?? 0,
      validatedAmount: request.validated_amount ?? 0, legacyAmount: request.legacy_amount ?? 0 },
    attendees: seats.map((seat) => ({ id: seat.id, firstNames: seat.first_names_snapshot ?? "", lastNames: seat.last_names_snapshot ?? "",
      price: seat.price_snapshot, status: seat.status, isComplimentary: seat.is_complimentary })),
    payments: payments.map((payment) => ({ id: payment.id, amount: payment.amount, reference: payment.payment_reference,
      note: payment.note, verifiedAt: payment.verified_at, verifiedByName: payment.verified_by ? names.get(payment.verified_by) ?? "Personal CCI" : "Personal CCI",
      seats: (allocationsResult.data ?? []).filter((allocation) => allocation.payment_id === payment.id)
        .map((allocation) => codes.get(allocation.registration_id) ?? "Plaza no disponible") })),
  });
}
