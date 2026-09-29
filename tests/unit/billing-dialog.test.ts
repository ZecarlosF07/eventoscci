import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { BillingList } from "@/features/billing/components/BillingList";
import { billingDetailSchema } from "@/features/billing/schemas/billing-detail.schema";
import { fetchBillingDetail } from "@/features/billing/services/fetch-billing-detail";
import { parseBillingFilters } from "@/features/billing/utils/billing-filters";
import { PaymentDetailLoading } from "@/features/participation/components/PaymentDetailLoading/PaymentDetailLoading";
import { PaymentRequestDialog } from "@/features/participation/components/PaymentRequestDialog/PaymentRequestDialog";

const activityId = "30000000-0000-4000-8000-000000000001";
const requestId = "30000000-0000-4000-8000-000000000002";
const detail = { activity_id: activityId, id: requestId, kind: "group", code: "CCI-GR-TEST", name: "Empresa Asociada",
  company_name: "Empresa Asociada", company_ruc: "20111111111", billing_type: "factura", billing_document: "20123456789",
  billing_name: "Destinatario Distinto", billing_address: "Av. Uno 12", billing_state: "provided", status: "partial",
  participation_amount: 80, validated_amount: 40, pending_amount: 40, legacy_amount: 0, complimentary_count: 1 };

test("el contrato de comprobantes conserva contexto y distingue datos ausentes de gratuitos", () => {
  const parsed = billingDetailSchema.parse({ ...detail, search_text: "privado", email: "privado" });
  assert.equal(parsed.company_ruc, "20111111111");
  assert.equal(parsed.billing_document, "20123456789");
  assert.equal("search_text" in parsed, false);
  assert.equal("email" in parsed, false);
  for (const billing_state of ["missing", "not_required"]) {
    assert.equal(billingDetailSchema.safeParse({ ...detail, kind: "individual", status: "cancelled", billing_state,
      company_name: null, company_ruc: null, billing_type: null, billing_document: null, billing_name: null, billing_address: null }).success, true);
  }
  assert.equal(billingDetailSchema.safeParse({ ...detail, pending_amount: -1 }).success, false);
});

test("la consulta independiente no usa caché y verifica ambas identidades", async (context) => {
  const signal = new AbortController().signal;
  const mock = context.mock.method(globalThis, "fetch", async () => Response.json(detail));
  assert.equal((await fetchBillingDetail(activityId, requestId, signal)).id, requestId);
  assert.deepEqual(mock.mock.calls[0].arguments, [`/api/admin/activities/${activityId}/billing/${requestId}`, { cache: "no-store", credentials: "same-origin", signal }]);
  for (const changed of [{ id: activityId }, { activity_id: requestId }]) {
    mock.mock.mockImplementation(async () => Response.json({ ...detail, ...changed }));
    await assert.rejects(fetchBillingDetail(activityId, requestId, signal), /respuesta del detalle no es válida/);
  }
});

test("errores de acceso y detalle ausente se muestran sin habilitar edición", async (context) => {
  const mock = context.mock.method(globalThis, "fetch", async () => Response.json({ error: "No autorizado" }, { status: 403 }));
  const signal = new AbortController().signal;
  await assert.rejects(fetchBillingDetail(activityId, requestId, signal), /No autorizado/);
  mock.mock.mockImplementation(async () => Response.json({ error: "Solicitud no disponible" }, { status: 404 }));
  await assert.rejects(fetchBillingDetail(activityId, requestId, signal), /Solicitud no disponible/);
});

test("Ver datos es una acción destacada, accesible y con enlace directo", () => {
  const markup = renderToStaticMarkup(createElement(BillingList, { activityId, filters: parseBillingFilters({}), items: [{ ...detail,
    company_key: detail.company_ruc, created_at: "2026-09-29T12:00:00Z", pending_count: 1, search_text: "Empresa", seat_count: 3 }] }));
  assert.match(markup, /Ver datos →/);
  assert.match(markup, /bg-cci-950[^\"]*text-white/);
  assert.match(markup, /min-h-11/);
  assert.match(markup, /aria-haspopup="dialog"/);
  assert.match(markup, /aria-controls="billing-request-dialog"/);
  assert.match(markup, /aria-label="Ver datos del comprobante CCI-GR-TEST"/);
  assert.match(markup, /vista=comprobantes/);
  assert.doesNotMatch(markup, /Validar pago|Confirmar pago/);
});

test("el popup reutiliza cierre, foco y loading centrado con título propio", () => {
  const markup = renderToStaticMarkup(createElement(PaymentRequestDialog, { requestId, onClose() {}, title: "Datos para comprobantes",
    dialogId: "billing-request-dialog", headingId: "billing-dialog-title" }, createElement(PaymentDetailLoading)));
  assert.match(markup, /id="billing-request-dialog"/);
  assert.match(markup, /aria-labelledby="billing-dialog-title"/);
  assert.match(markup, /Datos para comprobantes/);
  assert.match(markup, /items-center justify-center/);
  assert.match(markup, /animate-spin/);
  assert.match(markup, /Cargando detalle…/);
  assert.doesNotMatch(markup, /Detalle del pago/);
});

test("el listado no consulta el detalle y abrir no requiere navegación RSC", () => {
  const workspace = readFileSync("src/features/billing/components/BillingWorkspace.tsx", "utf8");
  assert.doesNotMatch(workspace, /getBillingDetail|<BillingDetail /);
  assert.match(workspace, /<BillingDialog activityId=/);
  const dialog = readFileSync("src/features/billing/components/BillingDialog.tsx", "utf8");
  assert.match(dialog, /key=\{requestId\}/);
  assert.match(dialog, /window.history.replaceState/);
  assert.doesNotMatch(dialog, /await |router.push|router.replace/);
  const loader = readFileSync("src/features/billing/components/BillingDetailLoader.tsx", "utf8");
  assert.match(loader, /useAdminDetail\(activityId, requestId, fetchBillingDetail\)/);
  assert.match(loader, /PaymentDetailLoading/);
  assert.match(loader, /Reintentar/);
});

test("endpoint y consulta mantienen permisos, RLS, contexto y payload mínimo", () => {
  const endpoint = readFileSync("src/app/api/admin/activities/[activityId]/billing/[requestId]/route.ts", "utf8");
  assert.match(endpoint, /!account\?\.isActive \|\| account.role === "student"/);
  assert.match(endpoint, /private, no-store/);
  assert.match(endpoint, /activityId: z.uuid\(\), requestId: z.uuid\(\)/);
  const query = readFileSync("src/features/billing/queries/get-billing.ts", "utf8").split("export async function getBillingDetail")[1];
  assert.match(query, /createServerSupabaseClient/);
  assert.match(query, /eq\("activity_id", activityId\).eq\("id", requestId\)/);
  assert.doesNotMatch(query, /select\("\*"|service.role|search_text|attendance|certificates/);
});

test("corrección conserva motivo y auditoría; solo al guardar recarga detalle y listado", () => {
  const editor = readFileSync("src/features/billing/components/BillingEditor.tsx", "utf8");
  assert.match(editor, /reason.trim\(\).length < 2/);
  assert.match(editor, /correctBilling\(\{ kind, id, billing: parsed.data, reason \}\)/);
  assert.match(editor, /if \(result.success\)[^\n]+onSaved\?\.\(result.message\); router.refresh\(\)/);
  assert.match(editor, /if \(!item.billing_type/);
  const detailSource = readFileSync("src/features/billing/components/BillingDetail.tsx", "utf8");
  assert.match(detailSource, /<CopyBilling text=\{billingCopyText\(item\)\}/);
  assert.match(detailSource, /<BillingEditor item=\{item\} key=\{item.id\} onSaved=\{onSaved\}/);
  assert.doesNotMatch(detailSource, /Validar pago|Confirmar pago|Cerrar detalle/);
});
