import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import test from "node:test";

import { generateCertificatePdf } from "@/features/certificates/services/generate-certificate-pdf";
import { ActivityCertificateFields } from "@/features/activities/components/ActivityCertificateFields/ActivityCertificateFields";

test("el certificado incluido y opcional muestran horas obligatorias mayores que cero", () => {
  for (const defaultMode of ["included", "optional_paid"] as const) {
    const html = renderToStaticMarkup(createElement(ActivityCertificateFields, { defaultMode, membersOnly: false }));
    assert.match(html, /id="academic_hours"[^>]*min="0.01"[^>]*required/);
    assert.match(html, /Debe ser mayor que cero/);
    assert.doesNotMatch(html, /Déjala vacía/);
  }
});

test("una actividad sin certificado conserva el campo inactivo sin exigir horas", () => {
  const html = renderToStaticMarkup(createElement(ActivityCertificateFields, { defaultMode: "none", membersOnly: false }));
  assert.match(html, /type="hidden" name="academic_hours" value=""/);
  assert.doesNotMatch(html, /id="academic_hours"/);
});


test("el motor PDF impide finalizar certificados de actividad con horas cero o ausentes", async () => {
  for (const academicHours of [0, null, -1, Number.NaN]) {
    await assert.rejects(generateCertificatePdf({ academicHours, accessUrl: "https://example.test/certificados/test", certificateCode: "CCI-CERT-TEST", certificateType: "activity", condition: "Participó", dateText: null, participantName: "Persona de prueba", signers: [], title: "Actividad de prueba" }), /ACADEMIC_HOURS_REQUIRED/);
  }
});
