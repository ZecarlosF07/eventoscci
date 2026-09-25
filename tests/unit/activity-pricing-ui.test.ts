import assert from "node:assert/strict";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { PriceDisplay } from "../../src/components/molecules/PriceDisplay/PriceDisplay";
import { ActivityCertificateBenefit } from "../../src/features/activities/components/ActivityCertificateBenefit/ActivityCertificateBenefit";
import { ActivityCertificateFields } from "../../src/features/activities/components/ActivityCertificateFields/ActivityCertificateFields";
import { ActivityPricingFields } from "../../src/features/activities/components/ActivityPricingFields/ActivityPricingFields";

const common = {
  onFreeChange: () => undefined,
  onMembersOnlyChange: () => undefined,
  status: "published" as const,
  type: "event" as const,
};

test("el formulario presenta exclusividad antes de gratuidad y oculta precios innecesarios", () => {
  const exclusive = renderToStaticMarkup(createElement(ActivityPricingFields, {
    ...common, isFree: false, membersOnly: true,
  }));
  assert.ok(exclusive.indexOf("Exclusiva para asociados") < exclusive.indexOf("Actividad gratuita"));
  assert.match(exclusive, /Tarifa para asociados/);
  assert.doesNotMatch(exclusive, /Tarifa general/);
  assert.match(exclusive, /Cupos disponibles/);

  const free = renderToStaticMarkup(createElement(ActivityPricingFields, {
    ...common, isFree: true, membersOnly: false,
  }));
  assert.doesNotMatch(free, /Tarifa de inscripción/);
  assert.doesNotMatch(free, /Indicaciones para realizar el pago/);
  assert.match(free, /Cupos disponibles/);
});

test("las horas y la tarifa general del certificado aparecen solo cuando corresponden", () => {
  const none = renderToStaticMarkup(createElement(ActivityCertificateFields, { membersOnly: false }));
  assert.doesNotMatch(none, /Horas académicas certificables/);

  const exclusive = renderToStaticMarkup(createElement(ActivityCertificateFields, {
    defaultMode: "optional_paid", membersOnly: true,
  }));
  assert.match(exclusive, /Horas académicas certificables/);
  assert.match(exclusive, /Precio del certificado para asociados/);
  assert.doesNotMatch(exclusive, /Precio general del certificado/);
});

test("las vistas públicas no anuncian tarifas generales en actividades exclusivas", () => {
  const participation = renderToStaticMarkup(createElement(PriceDisplay, {
    generalPrice: 0, isFree: false, memberPrice: 30, membersOnly: true,
  }));
  assert.match(participation, /Asociados/);
  assert.doesNotMatch(participation, /General/);

  const certificate = renderToStaticMarkup(createElement(ActivityCertificateBenefit, {
    generalPrice: 25, isActivityFree: false, memberPrice: 25,
    membersOnly: true, mode: "optional_paid",
  }));
  assert.match(certificate, /Asociados/);
  assert.doesNotMatch(certificate, /General/);
});
