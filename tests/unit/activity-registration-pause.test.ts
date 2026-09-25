import assert from "node:assert/strict";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ActivityRegistrationPauseField } from "../../src/features/activities/components/ActivityRegistrationPauseField/ActivityRegistrationPauseField";

const onChange = () => undefined;

test("no ofrece pausar inscripciones al crear una actividad", () => {
  const html = renderToStaticMarkup(createElement(ActivityRegistrationPauseField, {
    checked: false, onChange, visible: false,
  }));
  assert.equal(html, "");
});

test("muestra la pausa al editar y explica que no cancela registros existentes", () => {
  const html = renderToStaticMarkup(createElement(ActivityRegistrationPauseField, {
    checked: false, onChange, visible: true,
  }));
  assert.match(html, /Pausar nuevas inscripciones/);
  assert.match(html, /No cancela las inscripciones existentes/);
});

test("conserva una pausa existente si el control se oculta al cambiar de estado", () => {
  const html = renderToStaticMarkup(createElement(ActivityRegistrationPauseField, {
    checked: true, onChange, visible: false,
  }));
  assert.match(html, /name="registrations_closed_manually"/);
  assert.match(html, /value="on"/);
});
