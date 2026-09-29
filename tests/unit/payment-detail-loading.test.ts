import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { PaymentRequestLink } from "../../src/features/participation/components/PaymentRequestLink/PaymentRequestLink";
import { PaymentDetailLoading } from "../../src/features/participation/components/PaymentDetailLoading/PaymentDetailLoading";
import { paymentDetailSchema } from "../../src/features/participation/schemas/payment-detail.schema";
import { fetchPaymentDetail } from "../../src/features/participation/services/fetch-payment-detail";
import { paymentDialogUrl } from "../../src/features/participation/utils/payment-dialog-url";

const activityId = "28000000-0000-4000-8000-000000000001";
const requestId = "28000000-0000-4000-8000-000000000002";
const detail = { request: { id: requestId, kind: "group", code: "CCI-GR-28", name: "Empresa",
  companyRuc: "20888888881", pendingCount: 1, pendingAmount: 300, validatedAmount: 0, legacyAmount: 0 },
  attendees: [{ id: activityId, firstNames: "Persona", lastNames: "Prueba", price: 300, status: "pending", isComplimentary: false }], payments: [] };

test("abrir y cerrar conserva filtros, página, certificado y ancla sin añadir otra solicitud", () => {
  const base = `/admin/inscripciones/${activityId}/pagos?q=EMPRESA&tipo=group&pagina=3&certificado=${activityId}#pagos`;
  const opened = paymentDialogUrl(base, requestId);
  assert.equal(paymentDialogUrl(opened), base);
  assert.equal(new URL(opened, "http://local.invalid").searchParams.get("solicitud"), requestId);
  assert.equal(new URL(paymentDialogUrl(opened, activityId), "http://local.invalid").searchParams.getAll("solicitud").length, 1);
});
test("el disparador conserva enlace directo accesible y no utiliza prefetch de la página", () => {
  const markup = renderToStaticMarkup(createElement(PaymentRequestLink, { href: "/pagos?solicitud=test", requestId, label: "Ver pago CCI-GR-28", className: "min-h-11" }));
  assert.match(markup, /aria-haspopup="dialog"/);
  assert.match(markup, /href="\/pagos\?solicitud=test"/);
  assert.match(markup, /aria-label="Ver pago CCI-GR-28"/);
  const source = readFileSync("src/features/participation/components/PaymentRequestLink/PaymentRequestLink.tsx", "utf8");
  assert.match(source, /window.history.pushState/);
  assert.match(source, /event.metaKey \|\| event.ctrlKey/);
  assert.doesNotMatch(source, /next\/link|router.push/);
});
test("el detalle valida su contrato y no expone datos innecesarios", () => {
  const parsed = paymentDetailSchema.parse({ ...detail, billingDocument: "privado", search_text: "privado" });
  assert.equal(parsed.request.pendingAmount, 300);
  assert.equal("billingDocument" in parsed, false);
  assert.equal("search_text" in parsed, false);
  assert.equal(paymentDetailSchema.safeParse({ ...detail, request: { ...detail.request, pendingAmount: -1 } }).success, false);
});
test("la carga consulta solo el endpoint de la solicitud, sin caché y con cancelación", async (context) => {
  const signal = new AbortController().signal;
  const mock = context.mock.method(globalThis, "fetch", async () => Response.json(detail));
  const result = await fetchPaymentDetail(activityId, requestId, signal);
  assert.equal(result.request.id, requestId);
  assert.deepEqual(mock.mock.calls[0].arguments, [`/api/admin/activities/${activityId}/payments/${requestId}`, { cache: "no-store", credentials: "same-origin", signal }]);
});
test("errores de permisos, solicitud ausente y respuesta incorrecta no habilitan la validación", async (context) => {
  const mock = context.mock.method(globalThis, "fetch", async () => Response.json({ error: "No autorizado" }, { status: 403 }));
  const signal = new AbortController().signal;
  await assert.rejects(fetchPaymentDetail(activityId, requestId, signal), /No autorizado/);
  mock.mock.mockImplementation(async () => Response.json({ error: "No disponible" }, { status: 404 }));
  await assert.rejects(fetchPaymentDetail(activityId, requestId, signal), /No disponible/);
  mock.mock.mockImplementation(async () => Response.json({ ...detail, request: { ...detail.request, id: activityId } }));
  await assert.rejects(fetchPaymentDetail(activityId, requestId, signal), /respuesta del detalle no es válida/);
});
test("cerrar cancela la carga y las respuestas antiguas no reemplazan la solicitud actual", () => {
  const hook = readFileSync("src/features/admin-details/hooks/use-admin-detail.ts", "utf8");
  assert.match(hook, /return \(\) => controller.abort\(\)/);
  assert.match(hook, /if \(!controller.signal.aborted\)/);
  assert.match(hook, /state.key === resourceKey/);
  const loader = readFileSync("src/features/participation/components/PaymentDetailLoader/PaymentDetailLoader.tsx", "utf8");
  assert.match(loader, /PaymentDetailLoading/);
  assert.match(loader, /Reintentar/);
  const dialog = readFileSync("src/features/participation/components/PaymentRequestDetail/PaymentRequestDetail.tsx", "utf8");
  assert.match(dialog, /key=\{requestId\}/);
  assert.doesNotMatch(dialog, /await |getMemberGroupAdminDetail|createServerSupabaseClient/);
});
test("el endpoint exige permisos y restringe el contexto; la consulta omite pases, comprobantes y certificados", () => {
  const endpoint = readFileSync("src/app/api/admin/activities/[activityId]/payments/[requestId]/route.ts", "utf8");
  assert.match(endpoint, /!account\?\.isActive \|\| account.role === "student"/);
  assert.match(endpoint, /private, no-store/);
  assert.match(endpoint, /activityId: z.uuid\(\), requestId: z.uuid\(\)/);
  const query = readFileSync("src/features/participation/queries/get-payment-detail.ts", "utf8");
  assert.match(query, /eq\("activity_id", activityId\).eq\("id", requestId\)/);
  assert.match(query, /Promise.all/);
  assert.doesNotMatch(query, /member_complimentary_passes|audit_logs|billing_document|attendance\(|certificates\(/);
});
test("solo después de un pago válido se recargan el detalle y el listado", () => {
  for (const path of ["src/features/participation/components/IndividualPaymentForm/IndividualPaymentForm.tsx", "src/features/member-groups/components/MemberGroupPaymentForm/MemberGroupPaymentForm.tsx"]) {
    const source = readFileSync(path, "utf8");
    assert.match(source, /if \(result.success\)[^\n]+onVerified\?\.\(\); router.refresh\(\)/);
    assert.match(source, /idempotencyKey: key.current/);
  }
});

test("la carga centra texto y spinner, anuncia una vez el estado y respeta movimiento reducido", () => {
  const markup = renderToStaticMarkup(createElement(PaymentDetailLoading));
  assert.match(markup, /items-center justify-center/);
  assert.match(markup, /text-center/);
  assert.match(markup, /animate-spin/);
  assert.match(markup, /motion-reduce:animate-none/);
  assert.match(markup, /aria-busy="true"/);
  assert.match(markup, /role="status"/);
  assert.match(markup, /Cargando detalle…/);
  assert.match(markup, /<p aria-hidden="true"/);
});
