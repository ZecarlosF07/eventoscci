import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ParticipationPaymentNotice } from "../../src/features/participation/components/ParticipationPaymentNotice/ParticipationPaymentNotice";
import type { ParticipationPaymentNoticeProps } from "../../src/features/participation/types/participation.types";

const activity: ParticipationPaymentNoticeProps["activity"] = {
  activityId: "test-activity",
  certificatePendingCount: 0,
  paymentPendingRequests: 2,
  paymentPendingSeats: 5,
};

test("Los pendientes destacan sin alterar solicitudes, plazas ni el destino de pagos", () => {
  const html = renderToStaticMarkup(createElement(ParticipationPaymentNotice, { activity }));
  assert.match(html, /border-l-amber-500/);
  assert.match(html, /bg-amber-50/);
  assert.match(html, />2<\/strong> solicitudes con pago pendiente/);
  assert.match(html, /5 plazas pendientes/);
  assert.match(html, /href="\/admin\/inscripciones\/test-activity\/pagos"/);
  assert.match(html, /Ver pagos de esta actividad/);
  assert.match(html, /aria-hidden="true" class="flex size-8 shrink-0 items-center justify-center"/);
  assert.doesNotMatch(html, /animate-|role="alert"/);
});

test("Los certificados destacan por sí solos y conservan su cobro separado", () => {
  const html = renderToStaticMarkup(createElement(ParticipationPaymentNotice, {
    activity: { ...activity, paymentPendingRequests: 0, paymentPendingSeats: 0, certificatePendingCount: 6 },
  }));
  assert.match(html, />0<\/strong> solicitudes con pago pendiente/);
  assert.match(html, />6<\/strong> certificados con pago pendiente/);
  assert.match(html, /cobro separado/);
  assert.match(html, /bg-amber-50/);
});

test("Sin pendientes no se muestra una alarma; los contadores mantienen singular correcto", () => {
  const emptyHtml = renderToStaticMarkup(createElement(ParticipationPaymentNotice, {
    activity: { ...activity, paymentPendingRequests: 0, paymentPendingSeats: 0 },
  }));
  assert.doesNotMatch(emptyHtml, /amber|<svg/);
  const singleHtml = renderToStaticMarkup(createElement(ParticipationPaymentNotice, {
    activity: { ...activity, paymentPendingRequests: 1, paymentPendingSeats: 1, certificatePendingCount: 1 },
  }));
  assert.match(singleHtml, /solicitud con pago pendiente/);
  assert.match(singleHtml, /1 plaza pendiente/);
  assert.match(singleHtml, /certificado con pago pendiente/);
});
