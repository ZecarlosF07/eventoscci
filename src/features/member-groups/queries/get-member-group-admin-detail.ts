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
    client.from("activities").select("id, title, slug, status, deleted_at, member_free_passes_per_company").eq("id", request.activity_id).maybeSingle(),
    client.from("registrations").select("id, registration_code, first_names_snapshot, last_names_snapshot, price_snapshot, status, is_complimentary, job_title_snapshot, person:people!inner(document_type, document_number, email, phone), attendance:attendance(status), certificate:certificates(status)")
      .eq("member_group_request_id", request.id).is("deleted_at", null).order("created_at"),
    client.from("member_group_payments").select("id, amount, payment_reference, note, verified_at, verified_by")
      .eq("request_id", request.id).order("verified_at", { ascending: false }),
  ]);
  if (activityResult.error || registrationsResult.error || paymentsResult.error) {
    throw new Error("No se pudo consultar el detalle de la solicitud.");
  }
  const activity = activityResult.data;
  if (!activity || activity.deleted_at || activity.status === "archived") return null;
  const { count: complimentaryUsed, error: passError } = await client.from("member_complimentary_passes")
    .select("id", { count: "exact", head: true }).eq("activity_id", activity.id).eq("company_ruc", request.company_ruc);
  if (passError) throw new Error("No se pudo consultar el uso de pases gratuitos.", { cause: passError });
  const [passesResult, candidatesResult] = await Promise.all([
    client.from("member_complimentary_passes").select("id, registration_id")
      .eq("activity_id", activity.id).eq("company_ruc", request.company_ruc),
    client.from("registrations").select("id, registration_code, first_names_snapshot, last_names_snapshot")
      .eq("activity_id", activity.id).eq("ruc_snapshot", request.company_ruc)
      .eq("status", "pending").gt("price_snapshot", 0)
      .not("member_group_request_id", "is", null).is("deleted_at", null),
  ]);
  if (passesResult.error || candidatesResult.error) throw new Error("No se pudieron consultar los pases transferibles.");
  const passByRegistration = new Map((passesResult.data ?? []).map((pass) => [pass.registration_id, pass.id]));
  const passIds = (passesResult.data ?? []).map((pass) => pass.id);
  const historyResult = passIds.length ? await client.from("audit_logs")
    .select("id, created_at, old_data, new_data, metadata")
    .eq("action", "member_group.complimentary_pass_transferred")
    .in("entity_id", passIds).order("created_at", { ascending: false })
    : { data: [], error: null };
  if (historyResult.error) throw new Error("No se pudo consultar el historial de pases.", { cause: historyResult.error });
  const transferRegistrationIds = [...new Set((historyResult.data ?? []).flatMap((entry) => {
    const oldId = typeof entry.old_data === "object" && entry.old_data && !Array.isArray(entry.old_data) ? entry.old_data.registration_id : null;
    const newId = typeof entry.new_data === "object" && entry.new_data && !Array.isArray(entry.new_data) ? entry.new_data.registration_id : null;
    return [oldId, newId].filter((value): value is string => typeof value === "string");
  }))];
  const historySeatsResult = transferRegistrationIds.length ? await client.from("registrations")
    .select("id, registration_code, member_group_request_id").in("id", transferRegistrationIds)
    : { data: [], error: null };
  if (historySeatsResult.error) throw new Error("No se pudieron identificar las plazas transferidas.", { cause: historySeatsResult.error });
  const historySeats = new Map((historySeatsResult.data ?? []).map((seat) => [seat.id, seat]));
  const passHistory = (historyResult.data ?? []).flatMap((entry) => {
    const sourceId = typeof entry.old_data === "object" && entry.old_data && !Array.isArray(entry.old_data) ? entry.old_data.registration_id : null;
    const targetId = typeof entry.new_data === "object" && entry.new_data && !Array.isArray(entry.new_data) ? entry.new_data.registration_id : null;
    const source = typeof sourceId === "string" ? historySeats.get(sourceId) : null;
    const target = typeof targetId === "string" ? historySeats.get(targetId) : null;
    if (!source || !target || source.member_group_request_id !== request.id && target.member_group_request_id !== request.id) return [];
    const reason = typeof entry.metadata === "object" && entry.metadata && !Array.isArray(entry.metadata) && typeof entry.metadata.reason === "string" ? entry.metadata.reason : "Sin motivo disponible";
    return [{ id: entry.id, createdAt: entry.created_at, sourceCode: source.registration_code, targetCode: target.registration_code, reason }];
  });
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
      isComplimentary: item.is_complimentary,
      passId: passByRegistration.get(item.id) ?? null,
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
    passHistory,
    transferCandidates: (candidatesResult.data ?? []).map((seat) => ({
      id: seat.id, label: `${seat.first_names_snapshot ?? ""} ${seat.last_names_snapshot ?? ""} · ${seat.registration_code}`,
    })),
    request: {
      id: request.id, code: request.request_code, companyRuc: request.company_ruc,
      companyName: request.company_name_snapshot, billingType: request.billing_type,
      billingDocument: request.billing_document, billingName: request.billing_name,
      billingAddress: request.billing_address, createdAt: request.created_at,
      coordinatorEmail: request.coordinator_email, isFree: request.is_free_snapshot,
      complimentaryQuota: activity.member_free_passes_per_company,
      complimentaryUsed: complimentaryUsed ?? 0,
      ageDays: Math.floor((Date.now() - new Date(request.created_at).getTime()) / 86400000),
    },
  };
}
