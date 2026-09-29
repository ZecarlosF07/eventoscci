import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { renderAdminFilters } from "./fixtures/admin-router";
import { ActivityPaymentFilters } from "../../src/features/participation/components/ActivityPaymentFilters/ActivityPaymentFilters";
import { ActivityPaymentList } from "../../src/features/participation/components/ActivityPaymentList/ActivityPaymentList";
import { ParticipationActivityTabs } from "../../src/features/participation/components/ParticipationActivityTabs/ParticipationActivityTabs";
import { PaymentRequestDialog } from "../../src/features/participation/components/PaymentRequestDialog/PaymentRequestDialog";
import { parsePaymentFilters } from "../../src/features/participation/utils/payment-filters";

const activityId = "28000000-0000-4000-8000-000000000001";
const filters = parsePaymentFilters({});

test("activity navigation has exactly three contextual tabs", () => {
  const markup = renderToStaticMarkup(createElement(ParticipationActivityTabs, { activityId, current: "payments" }));
  assert.match(markup, /Inscripciones/);
  assert.match(markup, /Pagos/);
  assert.match(markup, /Asistencia/);
  assert.equal((markup.match(/<a /g) ?? []).length, 3);
  assert.match(markup, new RegExp(`${activityId}/pagos`));
  assert.match(markup, /aria-current="page"/);
});
test("group payment list shows one request and distinguishes seats, courtesy and legacy amounts", () => {
  const markup = renderToStaticMarkup(createElement(ActivityPaymentList, { activityId, filters, items: [{
    activity_id: activityId, id: "28000000-0000-4000-8000-000000000002", kind: "group", code: "CCI-GR-28",
    name: "Empresa Asociada", company_ruc: "20888888881", search_text: "Empresa", created_at: "2026-09-25T15:00:00Z",
    seat_count: 5, pending_count: 3, pending_amount: 120, validated_amount: 40, legacy_amount: 40,
    complimentary_count: 1, status: "partial",
  }] }));
  assert.equal((markup.match(/<article /g) ?? []).length, 1);
  assert.match(markup, /3 de 5/);
  assert.match(markup, /120.00/);
  assert.match(markup, /1 plazas con pase gratuito/);
  assert.match(markup, /sin referencia de pago registrada/);
  assert.doesNotMatch(markup, /Confirmar pago/);
});
test("empty list is explicit and filters have visible labels", () => {
  const empty = renderToStaticMarkup(createElement(ActivityPaymentList, { activityId, filters, items: [] }));
  assert.match(empty, /No hay solicitudes de participación/);
  const controls = renderAdminFilters(createElement(ActivityPaymentFilters, { filters }));
  assert.match(controls, /Pago de participación/);
  assert.match(controls, /Certificados opcionales/);
  assert.match(controls, /Individuales y grupales/);
  assert.match(controls, /Pendientes \(incluye parciales\)/);
});
test("inscriptions and group details no longer offer monetary confirmation", () => {
  const row = readFileSync("src/features/registrations/components/RegistrationRowActions/RegistrationRowActions.tsx", "utf8");
  assert.doesNotMatch(row, /Verificar y confirmar|open\("confirm"/);
  assert.match(row, /getActivityPaymentsRoute/);
  const group = readFileSync("src/app/(admin)/admin/(protected)/inscripciones/solicitudes/[id]/page.tsx", "utf8");
  assert.doesNotMatch(group, /MemberGroupPaymentForm/);
  assert.match(group, /Gestionar pago en Pagos/);
});
test("certificate controls default to links outside the payments workspace", () => {
  const actions = readFileSync("src/features/registrations/components/CertificateCommercialActions/CertificateCommercialActions.tsx", "utf8");
  assert.match(actions, /paymentWorkspace = false/);
  assert.match(actions, /if \(!paymentWorkspace\) return <Link/);
});

test("payment detail keeps the associated RUC in its heading and links to billing without repeating recipient fields", () => {
  const detail = readFileSync("src/features/participation/components/PaymentDetailContent/PaymentDetailContent.tsx", "utf8");
  assert.match(detail, /payment-detail-heading[^\n]+RUC asociado:[^\n]+request\.companyRuc/);
  assert.match(detail, /Ver datos para comprobantes →/);
  assert.match(detail, /billingUrl\(activityId\)[^\n]+solicitud=\$\{request\.id\}/);
  assert.doesNotMatch(detail, /Comprobante solicitado|RUC de facturación|billingDocument|billingName|billingAddress/);
});

test("payment popup has a named native dialog, persistent close control and scrollable content", () => {
  const markup = renderAdminFilters(createElement(PaymentRequestDialog, {
    onClose: () => {},
    requestId: "request",
  }, createElement("p", null, "Contenido de la solicitud")));
  assert.match(markup, /<dialog/);
  assert.match(markup, /aria-labelledby="payment-dialog-title"/);
  assert.match(markup, /aria-modal="true"/);
  assert.match(markup, /Cerrar detalle ×/);
  assert.match(markup, /overflow-y-auto/);
  assert.match(markup, /Contenido de la solicitud/);
});

test("payment detail is wrapped in the popup; native Escape, focus and context are retained", () => {
  const dialog = readFileSync("src/features/participation/components/PaymentRequestDialog/PaymentRequestDialog.tsx", "utf8");
  const detail = readFileSync("src/features/participation/components/PaymentRequestDetail/PaymentRequestDetail.tsx", "utf8");
  assert.match(detail, /<PaymentRequestDialog/);
  assert.match(detail, /window.history.replaceState/);
  assert.match(detail, /paymentDialogUrl\(window.location.href\)/);
  assert.match(dialog, /dialog.showModal\(\)/);
  assert.match(dialog, /onCancel=/);
  assert.match(dialog, /event.preventDefault\(\); onClose\(\)/);
  assert.doesNotMatch(dialog, /router.replace|useRouter/);
  assert.match(dialog, /restorePaymentDialogFocus/);
  assert.match(dialog, /document.body.style.overflow = previousOverflow/);
  const focus = readFileSync("src/features/participation/utils/payment-dialog-focus.ts", "utf8");
  assert.match(focus, /previousFocus.getClientRects\(\).length > 0/);
  assert.match(focus, /find\(\(trigger\) => trigger.getClientRects\(\).length > 0\)/);
});
