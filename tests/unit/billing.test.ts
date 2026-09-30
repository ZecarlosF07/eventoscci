import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BillingFields } from "@/features/billing/components/BillingFields";
import { IndividualBillingFields } from "@/features/billing/components/IndividualBillingFields";
import { BillingList } from "@/features/billing/components/BillingList";
import { BillingWorkspaceTabs } from "@/features/billing/components/BillingWorkspaceTabs";
import { BillingToolbar } from "@/features/billing/components/BillingToolbar";
import { billingSchema } from "@/features/billing/schemas/billing.schema";
import type { BillingRequest, BillingInput } from "@/features/billing/types/billing.types";
import { billingRequestsToTable } from "@/features/billing/utils/billing-export";
import { billingCopyText, billingLabel } from "@/features/billing/utils/billing-display";
import { billingUrl, parseBillingFilters } from "@/features/billing/utils/billing-filters";
import { applicableBilling, copyBillingSource } from "@/features/billing/utils/billing-input";
import { parseRegistrationFormData } from "@/features/registrations/utils/registration-form-data";
import { validateRegistrationWithBilling } from "@/features/registrations/utils/registration-billing-validation";
import { renderAdminFilters } from "./fixtures/admin-router";

const boleta: BillingInput = { type: "boleta", document: "12345678", name: "Ana Pérez", address: "No enviar" };
const factura: BillingInput = { type: "factura", document: "20123456789", name: "Empresa Distinta", address: "Av. Uno 12" };
const item: BillingRequest = { activity_id: "30000000-0000-4000-8000-000000000001", id: "30000000-0000-4000-8000-000000000002", kind: "group", code: "CCI-GR-TEST", name: "Empresa Asociada",
  company_ruc: "20111111111", company_key: "20111111111", company_name: "Empresa Asociada", created_at: "2026-09-28T15:00:00Z", status: "partial", seat_count: 3, pending_count: 1, pending_amount: 40,
  validated_amount: 40, legacy_amount: 0, complimentary_count: 1, participation_amount: 80, billing_type: "factura", billing_document: factura.document, billing_name: factura.name, billing_address: factura.address ?? null,
  billing_state: "provided", search_text: "Empresa" };

test("boleta normaliza y elimina dirección inactiva", () => {
  assert.deepEqual(billingSchema.parse({ ...boleta, name: " Ana Pérez " }), { type: "boleta", document: boleta.document, name: boleta.name });
  assert.deepEqual(applicableBilling(boleta), { type: "boleta", document: boleta.document, name: boleta.name });
});
test("factura exige documento, razón social y dirección", () => {
  assert.equal(billingSchema.safeParse(factura).success, true);
  for (const invalid of [{ ...factura, document: "12345678" }, { ...factura, address: " " }, { ...factura, name: "a" }]) assert.equal(billingSchema.safeParse(invalid).success, false);
  assert.equal(billingSchema.safeParse({ ...boleta, document: 12345678 }).success, false);
});
test("copiar CE no lo convierte en DNI ni asume RUC", () => {
  assert.equal(copyBillingSource("boleta", { documentType: "ce", document: "CE123456", name: "Ana" }).document, "");
  assert.equal(copyBillingSource("boleta", { documentType: "dni", document: "12345678", name: "Ana" }).document, "12345678");
  assert.deepEqual(copyBillingSource("factura", { document: factura.document, name: factura.name, address: factura.address }), factura);
});
test("validación contextual requiere comprobante solo con precio positivo", () => {
  const form = new FormData();
  for (const [key, value] of Object.entries({ document_type: "dni", document_number: "12345678", first_names: "Ana", last_names: "Pérez", email: "ana@example.test", phone: "900000001", registration_type: "general", job_title: "Gerente", company: "Organización de prueba" })) form.set(key, value);
  const input = parseRegistrationFormData(form);
  assert.equal(validateRegistrationWithBilling(input, 40).success, false);
  assert.equal(validateRegistrationWithBilling({ ...input, billing: boleta }, 40).success, true);
  const free = validateRegistrationWithBilling({ ...input, billing: { ...boleta, document: "incorrecto" } }, 0);
  assert.equal(free.success, true);
  if (free.success) assert.equal(free.data.billing, null);
});
test("filtros iniciales incluyen todo y paginaciones son independientes", () => {
  const defaults = parseBillingFilters({});
  assert.equal(defaults.state, "all"); assert.equal(defaults.type, "all");
  const filters = parseBillingFilters({ pagina: "2", pagina_solicitudes: "3", empresa: item.company_ruc ?? "", comprobante: "factura", solicitud: item.id ?? "", q: "100%_" });
  const params = new URL(billingUrl(item.activity_id ?? "", filters), "https://example.test").searchParams;
  assert.equal(params.get("pagina"), "2"); assert.equal(params.get("pagina_solicitudes"), "3"); assert.equal(params.get("vista"), "comprobantes");
  assert.equal(parseBillingFilters({ pagina: "1.5", comprobante: "unknown", empresa: "other" }).page, 1);
});
test("Excel tiene una fila por solicitud sin duplicar total por asistentes", () => {
  const table = billingRequestsToTable([{ ...item, billing_name: "=WEBSERVICE()" }]);
  assert.equal(table.rows.length, 1);
  assert.ok(table.rows[0].includes("=WEBSERVICE()"));
  assert.ok(table.rows[0].includes("20111111111"));
  assert.ok(table.rows[0].includes("20123456789"));
  assert.ok(table.rows[0].includes(80));
  assert.ok(table.rows[0].includes(40));
});
test("copiar y mostrar destinatario no confunde RUC asociado con RUC de facturación", () => {
  const copy = billingCopyText(item);
  assert.match(copy, /20123456789/); assert.doesNotMatch(copy, /20111111111/);
  assert.equal(billingLabel({ ...item, billing_type: null, billing_state: "missing" }), "Sin datos de comprobante");
});
test("dos vistas secundarias conservan el contexto de Pagos", () => {
  const markup = renderToStaticMarkup(createElement(BillingWorkspaceTabs, { activityId: item.activity_id ?? "", current: "billing" }));
  assert.match(markup, /Datos para comprobantes/); assert.match(markup, /Validar pagos/); assert.equal((markup.match(/<a /g) ?? []).length, 2);
  const filters = renderAdminFilters(createElement(BillingToolbar, { filters: parseBillingFilters({}), total: 3 }));
  assert.match(filters, /Todas las situaciones/); assert.doesNotMatch(filters, />Buscar</);
});
test("tabla diferencia cortesías, importes y cancelaciones sin botones monetarios", () => {
  const markup = renderToStaticMarkup(createElement(BillingList, { activityId: item.activity_id ?? "", items: [item, { ...item, id: "30000000-0000-4000-8000-000000000003", status: "cancelled" }], filters: parseBillingFilters({}) }));
  assert.match(markup, /Cancelada/); assert.match(markup, /1 cortesías/); assert.match(markup, /40.00/); assert.doesNotMatch(markup, /Validar pago|Confirmar pago/);
});
test("formulario reutilizable tiene controles etiquetados y errores específicos", () => {
  const markup = renderToStaticMarkup(createElement(BillingFields, { billing: factura, onChange() {}, errors: { document: "RUC incorrecto" } }));
  assert.match(markup, /RUC incorrecto/); assert.match(markup, /aria-invalid="true"/); assert.match(markup, /billing-address/); assert.match(markup, /type="radio"/);
});
test("la copia en el formulario individual es explícita y estudiantes no ofrecen datos laborales", () => {
  const professional = renderToStaticMarkup(createElement(IndividualBillingFields, { allowCompanyCopy: true, billing: factura, onChange() {} }));
  assert.match(professional, /Copiar empresa \/ organización y RUC/);
  const student = renderToStaticMarkup(createElement(IndividualBillingFields, { allowCompanyCopy: false, billing: factura, onChange() {} }));
  assert.doesNotMatch(student, /Copiar empresa \/ organización/);
  const receipt = renderToStaticMarkup(createElement(IndividualBillingFields, { allowCompanyCopy: false, billing: boleta, onChange() {} }));
  assert.match(receipt, /Copiar los datos del participante/);
});
test("correcciones tienen una única ubicación y resultados públicos no consultan billing", () => {
  const groupDetail = readFileSync("src/app/(admin)/admin/(protected)/inscripciones/solicitudes/[id]/page.tsx", "utf8");
  assert.doesNotMatch(groupDetail, /MemberGroupBillingEditor/); assert.match(groupDetail, /Datos para comprobantes/);
  const registration = readFileSync("src/features/registrations/mutations/register-activity.ts", "utf8");
  assert.match(registration, /validateRegistrationWithBilling/);
});
