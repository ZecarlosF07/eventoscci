import assert from "node:assert/strict";
import test from "node:test";

import { memberGroupInputSchema } from "@/features/member-groups/schemas/member-group.schema";
import type { MemberGroupAdminListItem } from "@/features/member-groups/types/member-group.types";
import { memberGroupsToCsv } from "@/features/member-groups/utils/member-group-csv";
import { getMemberPassPricing } from "@/features/member-groups/utils/member-pass-pricing";

const attendee = {
  document_type: "dni", document_number: "12345678", first_names: "Ana", last_names: "Pérez",
  email: "ana@example.test", phone: "912345678", job_title: "Gerente", request_certificate: false,
};

test("valida grupo, duplicados y datos de facturación independientes del RUC asociado", () => {
  const input = { ruc: "20123456789", attendees: [attendee], expected_free_count: 0, billing: { type: "factura", document: "20987654321", name: "Otra Empresa", address: "Calle Uno" }, future_topics_suggestion: "" };
  assert.equal(memberGroupInputSchema.safeParse(input).success, true);
  assert.equal(memberGroupInputSchema.safeParse({ ...input, attendees: [attendee, attendee] }).success, false);
  assert.equal(memberGroupInputSchema.safeParse({ ...input, billing: { ...input.billing, address: "" } }).success, false);
  assert.equal(memberGroupInputSchema.safeParse({ ...input, future_topics_suggestion: "x".repeat(501) }).success, false);
});

test("permite solicitud gratuita sin comprobante", () => {
  assert.equal(memberGroupInputSchema.safeParse({ ruc: "20123456789", attendees: [attendee], expected_free_count: 0, billing: null, future_topics_suggestion: "" }).success, true);
});

test("los pases se descuentan del saldo por RUC, en orden y sin reducir el cupo", () => {
  assert.deepEqual(getMemberPassPricing(3, 40, false, { quota: 2, used: 1, remaining: 1 }), {
    complimentaryCount: 1, paidCount: 2, total: 80,
  });
  assert.deepEqual(getMemberPassPricing(2, 40, false, { quota: 2, used: 2, remaining: 0 }), {
    complimentaryCount: 0, paidCount: 2, total: 80,
  });
  assert.deepEqual(getMemberPassPricing(2, 40, true, { quota: 2, used: 0, remaining: 2 }), {
    complimentaryCount: 0, paidCount: 0, total: 0,
  });
});

test("CSV agrupa ingresos una sola vez y neutraliza fórmulas", () => {
  const group = {
    id: "group", request_code: "CCI-GR-000001", activity_title: "Evento", company_ruc: "20123456789",
    company_name_snapshot: "=SUM(A1:A2)", billing_type: "factura", billing_document: "20987654321",
    total: 80, confirmed_amount: 40, pending_amount: 40, created_at: "2026-09-24T00:00:00Z",
  } as MemberGroupAdminListItem;
  const csv = memberGroupsToCsv([group], [
    { requestId: "group", code: "A", firstNames: "Ana", lastNames: "Pérez", document: "DNI 12345678", email: "ana@example.test", status: "confirmed", price: 40, isComplimentary: false },
    { requestId: "group", code: "B", firstNames: "Bea", lastNames: "Pérez", document: "DNI 87654321", email: "bea@example.test", status: "pending", price: 40, isComplimentary: false },
  ]);
  assert.match(csv, /"'=SUM\(A1:A2\)"/);
  assert.equal(csv.split("\r\n").length, 3);
  assert.equal(csv.match(/"80"/g)?.length, 1);
});
