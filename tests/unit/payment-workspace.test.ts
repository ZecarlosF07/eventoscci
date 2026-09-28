import assert from "node:assert/strict";
import test from "node:test";

import { legacyPaymentRoute } from "../../src/features/participation/utils/legacy-payment-route";
import { parsePaymentFilters, paymentAgeDays, paymentWorkspaceUrl } from "../../src/features/participation/utils/payment-filters";
import { parseParticipationFilters } from "../../src/features/participation/utils/participation-filters";
import { getActivityPaymentsRoute } from "../../src/features/participation/utils/participation-routes";

const ACTIVITY = "28000000-0000-4000-8000-000000000001";
const REQUEST = "28000000-0000-4000-8000-000000000002";

test("payment filters default to pending and page one", () => {
  assert.deepEqual(parsePaymentFilters({}), { page: 1, certificatePage: 1, state: "pending",
    certificateState: "pending", kind: "all", query: "", requestId: undefined, certificateId: undefined });
});
test("invalid pages, kinds and UUIDs never reach payment queries", () => {
  const filters = parsePaymentFilters({ pagina: "Infinity", pagina_certificados: "-5", tipo: "member", solicitud: "invalid", certificado: "invalid" });
  assert.equal(filters.page, 1);
  assert.equal(filters.certificatePage, 1);
  assert.equal(filters.requestId, undefined);
  assert.equal(filters.certificateId, undefined);
  assert.equal(filters.kind, "all");
});
test("opening payment preserves separate pagination and filters", () => {
  const filters = parsePaymentFilters({ pagina: "6", pagina_certificados: "3", estado: "all", estado_certificado: "complete", tipo: "group", q: "RUC & nombre" });
  const url = new URL(paymentWorkspaceUrl(ACTIVITY, filters, REQUEST), "http://localhost");
  assert.equal(url.searchParams.get("pagina"), "6");
  assert.equal(url.searchParams.get("pagina_certificados"), "3");
  assert.equal(url.searchParams.get("q"), "RUC & nombre");
  assert.equal(url.searchParams.get("solicitud"), REQUEST);
  assert.equal(url.searchParams.get("tipo"), "group");
});
test("legacy group queue redirects to the activity payment context", () => {
  const url = new URL(legacyPaymentRoute({ actividad: ACTIVITY, estado: "partial", q: "20888888881", pagina: "4" }, true), "http://localhost");
  assert.equal(url.pathname, `/admin/inscripciones/${ACTIVITY}/pagos`);
  assert.equal(url.searchParams.get("estado"), "pending");
  assert.equal(url.searchParams.get("tipo"), "group");
  assert.equal(url.searchParams.get("pagina"), "4");
});
test("legacy queue without activity selects all activities with debts", () => {
  const url = new URL(legacyPaymentRoute({ tipo_actividad: "training" }), "http://localhost");
  assert.equal(url.pathname, "/admin/inscripciones");
  assert.equal(url.searchParams.get("periodo"), "payments");
  assert.equal(url.searchParams.get("tipo"), "training");
});
test("certificate links point only to payments and open history regardless of state", () => {
  const url = new URL(getActivityPaymentsRoute(ACTIVITY, undefined, REQUEST), "http://localhost");
  assert.equal(url.searchParams.get("certificado"), REQUEST);
  assert.equal(url.searchParams.get("estado_certificado"), "all");
});
test("overdue payments filter is independent of upcoming dates", async () => {
  const filters = await parseParticipationFilters(Promise.resolve({ periodo: "payments" }));
  assert.equal(filters.period, "all");
  assert.equal(filters.paymentsOnly, true);
});
test("age is whole elapsed days and is never negative", () => {
  const now = new Date("2026-09-28T15:00:00Z").getTime();
  assert.equal(paymentAgeDays("2026-09-25T15:00:00Z", now), 3);
  assert.equal(paymentAgeDays("2026-09-30T15:00:00Z", now), 0);
});
