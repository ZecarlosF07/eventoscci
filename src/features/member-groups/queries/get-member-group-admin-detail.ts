import "server-only";

import type { MemberGroupAdminDetail } from "@/features/member-groups/types/member-group.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getMemberGroupAdminDetail(id: string): Promise<MemberGroupAdminDetail | null> {
  const client = await createServerSupabaseClient();
  const { data: request, error: requestError } = await client.from("member_group_requests")
    .select("id, activity_id, request_code, company_ruc, company_name_snapshot, billing_type, billing_document, billing_name, billing_address, created_at, coordinator_email, is_free_snapshot")
    .eq("id", id).maybeSingle();
  if (requestError) throw new Error("No se pudo consultar la solicitud.", { cause: requestError });
  if (!request) return null;

  const [activityResult, registrationsResult, paymentsResult] = await Promise.all([
    client.from("activities").select("id, title, slug, status, deleted_at").eq("id", request.activity_id).maybeSingle(),
    client.from("registrations").select("id, registration_code, first_names_snapshot, last_names_snapshot, price_snapshot, status, job_title_snapshot, person:people!inner(document_type, document_number, email, phone), attendance:attendance(status), certificate:certificates(status)")
      .eq("member_group_request_id", request.id).is("deleted_at", null).order("created_at"),
    client.from("member_group_payments").select("id, amount, payment_reference, note, verified_at, verified_by")
      .eq("request_id", request.id).order("verified_at", { ascending: false }),
  ]);
  if (activityResult.error || registrationsResult.error || paymentsResult.error) {
    throw new Error("No se pudo consultar el detalle de la solicitud.");
  }
  const activity = activityResult.data;
  if (!activity || activity.deleted_at || activity.status === "archived") return null;
  const payments = paymentsResult.data ?? [];
  const paymentIds = payments.map((payment) => payment.id);
  const actorIds = [...new Set(payments.map((payment) => payment.verified_by).filter((actor): actor is string => Boolean(actor)))];
  const [allocationsResult, actorsResult] = await Promise.all([
    paymentIds.length ? client.from("member_group_payment_allocations").select("payment_id, registration_id").in("payment_id", paymentIds) : Promise.resolve({ data: [], error: null }),
    actorIds.length ? client.from("user_accounts").select("user_id, person:people!inner(first_names, last_names)").in("user_id", actorIds) : Promise.resolve({ data: [], error: null }),
  ]);
  if (allocationsResult.error || actorsResult.error) throw new Error("No se pudieron consultar los pagos de la solicitud.");
  const codes = new Map((registrationsResult.data ?? []).map((item) => [item.id, item.registration_code]));
  const actorNames = new Map((actorsResult.data ?? []).map((actor) => [actor.user_id, `${actor.person.first_names} ${actor.person.last_names}`]));
  return {
    activity: { id: activity.id, title: activity.title, slug: activity.slug },
    attendees: (registrationsResult.data ?? []).map((item) => ({
      id: item.id,
      code: item.registration_code,
      firstNames: item.first_names_snapshot ?? "",
      lastNames: item.last_names_snapshot ?? "",
      document: `${item.person.document_type.toUpperCase()} ${item.person.document_number}`,
      email: item.person.email,
      phone: item.person.phone,
      jobTitle: item.job_title_snapshot,
      price: item.price_snapshot,
      status: item.status,
      attendance: item.attendance?.[0]?.status ?? "pending",
      certificate: item.certificate?.[0]?.status ?? null,
    })),
    payments: payments.map((payment) => ({
      id: payment.id, amount: payment.amount, reference: payment.payment_reference,
      note: payment.note, verifiedAt: payment.verified_at,
      verifiedByName: payment.verified_by ? actorNames.get(payment.verified_by) ?? "Personal CCI" : "Personal CCI",
      seats: (allocationsResult.data ?? []).filter((allocation) => allocation.payment_id === payment.id)
        .map((allocation) => codes.get(allocation.registration_id) ?? allocation.registration_id),
    })),
    request: {
      id: request.id, code: request.request_code, companyRuc: request.company_ruc,
      companyName: request.company_name_snapshot, billingType: request.billing_type,
      billingDocument: request.billing_document, billingName: request.billing_name,
      billingAddress: request.billing_address, createdAt: request.created_at,
      coordinatorEmail: request.coordinator_email, isFree: request.is_free_snapshot,
      ageDays: Math.floor((Date.now() - new Date(request.created_at).getTime()) / 86400000),
    },
  };
}
