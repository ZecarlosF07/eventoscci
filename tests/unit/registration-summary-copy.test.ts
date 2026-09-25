import assert from "node:assert/strict";
import test from "node:test";

import { getRegistrationProcessMessage } from "../../src/features/registrations/utils/registration-summary-copy";

test("el resumen distingue confirmación gratuita, preinscripción y plazas grupales", () => {
  assert.match(getRegistrationProcessMessage(true, false), /se confirmará al enviar/);
  assert.match(getRegistrationProcessMessage(true, true), /plazas se confirmarán al enviar/);
  assert.match(getRegistrationProcessMessage(false, false), /preinscripción/);
  assert.match(getRegistrationProcessMessage(false, true), /quedarán reservadas/);
});
