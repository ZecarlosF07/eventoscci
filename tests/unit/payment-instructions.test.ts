import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import test from "node:test";

import { PaymentInstructions } from "../../src/features/registrations/components/PaymentInstructions/PaymentInstructions";

test("las indicaciones de pago conservan saltos y escapan contenido ingresado", () => {
  const html = renderToStaticMarkup(createElement(PaymentInstructions, {
    note: "Primera línea\n<script>alert(1)</script>",
  }));
  assert.match(html, /Cómo realizar el pago/);
  assert.match(html, /whitespace-pre-line/);
  assert.match(html, /overflow-wrap:anywhere/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script>/);
});
