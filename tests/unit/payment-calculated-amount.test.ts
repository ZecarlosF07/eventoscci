import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import type { MemberGroupAdminDetail } from "../../src/features/member-groups/types/member-group.types";
import { getMemberGroupPaymentAmount } from "../../src/features/member-groups/utils/member-group-payment-amount";

const seat: MemberGroupAdminDetail["attendees"][number] = {
  id: "paid", code: "CCI-01", firstNames: "Persona", lastNames: "Prueba",
  document: "12345678", email: "prueba@example.com", phone: "999999999", jobTitle: null,
  price: 300, status: "pending", isComplimentary: false,
  passId: null, attendance: "pending", certificate: null,
};

test("El importe grupal sigue la selección sin exigir digitación ni duplicar IDs", () => {
  const seats = [seat, { ...seat, id: "second", price: 200 }];
  assert.equal(getMemberGroupPaymentAmount(seats, []), 0);
  assert.equal(getMemberGroupPaymentAmount(seats, ["paid"]), 300);
  assert.equal(getMemberGroupPaymentAmount(seats, ["paid", "second"]), 500);
  assert.equal(getMemberGroupPaymentAmount(seats, ["second"]), 200);
  assert.equal(getMemberGroupPaymentAmount(seats, ["paid", "paid", "unknown"]), 300);
});

test("El total solo incluye plazas pendientes, positivas y sin pase gratuito", () => {
  const seats: MemberGroupAdminDetail["attendees"] = [seat,
    { ...seat, id: "confirmed", status: "confirmed" },
    { ...seat, id: "cancelled", status: "cancelled" },
    { ...seat, id: "complimentary", isComplimentary: true },
    { ...seat, id: "free", price: 0 },
  ];
  assert.equal(getMemberGroupPaymentAmount(seats, seats.map((item) => item.id)), 300);
});

test("Los precios históricos se suman en céntimos sin residuos decimales", () => {
  const seats = [{ ...seat, id: "one", price: 0.1 }, { ...seat, id: "two", price: 0.2 }];
  assert.equal(getMemberGroupPaymentAmount(seats, ["one", "two"]), 0.3);
});

test("Ambos formularios muestran el importe calculado y conservan referencia, nota y confirmación", () => {
  const group = readFileSync("src/features/member-groups/components/MemberGroupPaymentForm/MemberGroupPaymentForm.tsx", "utf8");
  const individual = readFileSync("src/features/participation/components/IndividualPaymentForm/IndividualPaymentForm.tsx", "utf8");
  for (const source of [group, individual]) {
    assert.doesNotMatch(source, /Importe recibido|type="number"|values\.get\("amount"\)/);
    assert.match(source, /Importe a validar/);
    assert.match(source, /Medio o referencia del pago/);
    assert.match(source, /Nota \(opcional\)/);
    assert.match(source, /window\.confirm/);
    assert.match(source, /idempotencyKey: key.current/);
  }
  assert.match(group, /receivedAmount: amount/);
  assert.match(group, /getMemberGroupPaymentAmount\(seats, selected\)/);
  assert.match(individual, /receivedAmount: price/);
});
