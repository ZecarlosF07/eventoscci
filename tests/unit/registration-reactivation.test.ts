import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import test from "node:test";

import { OperationNotice } from "@/components/molecules/OperationNotice";

test("la reactivación comunica si volvió a confirmadas o quedó pendiente de pago", () => {
  const confirmed = renderToStaticMarkup(createElement(OperationNotice, { result: "reactivada-confirmada" }));
  const pending = renderToStaticMarkup(createElement(OperationNotice, { result: "reactivada-pendiente" }));
  assert.match(confirmed, /quedó confirmada/);
  assert.match(confirmed, /Confirmadas/);
  assert.match(pending, /pendiente de pago/);
  assert.match(pending, /Pendientes/);
  assert.match(confirmed, /role="status"/);
});

test("los bloqueos de reactivación indican cupo, duplicidad o transferencia del pase", () => {
  for (const [result, message] of [
    ["error-reactivar-cupo", /cupos disponibles/],
    ["error-reactivar-duplicada", /otra inscripción activa/],
    ["error-reactivar-pase", /transferencia/],
    ["error-reactivar-actividad", /archivada, cancelada o eliminada/],
  ] as const) {
    const markup = renderToStaticMarkup(createElement(OperationNotice, { result }));
    assert.match(markup, message);
    assert.match(markup, /role="alert"/);
  }
});
