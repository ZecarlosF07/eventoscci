import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import test from "node:test";

import { CertificateHoursProgressBar } from "@/features/certificates/components/CertificateHoursRegeneration/CertificateHoursProgressBar";
import { certificateHoursProgress } from "@/features/certificates/utils/certificate-hours-progress";
import { certificateHoursResultMessage } from "@/features/certificates/utils/certificate-hours-result";

test("el progreso conserva el total entre lotes y llega al 100% al completar", () => {
  for (const [completed, percentage] of [[0, 0], [20, 13], [40, 27], [140, 97], [143, 100]]) {
    assert.deepEqual(certificateHoursProgress(completed, 143), { completed, total: 143, percentage });
  }
  assert.equal(certificateHoursProgress(9999, 10000).percentage, 99);
});

test("el resumen distingue el conteo de la ejecución y los pendientes reales, sin dar por terminados 100 de 143", () => {
  assert.equal(certificateHoursResultMessage(100, 43), "100 certificados corregidos en esta ejecución. Quedan 43 pendientes. Puedes reanudar la corrección.");
  assert.equal(certificateHoursResultMessage(23, 0), "23 certificados corregidos en esta ejecución. Corrección completada: no quedan certificados pendientes.");
  assert.match(certificateHoursResultMessage(100, undefined, "La conexión se interrumpió."), /No se pudo verificar.*La conexión se interrumpió/);
  assert.doesNotMatch(certificateHoursResultMessage(100, undefined), /Corrección completada/);
  assert.match(certificateHoursResultMessage(17, 126, "Faltó un recurso de la plantilla."), /126 pendientes.*Faltó un recurso/);
});

test("el avance parcial y los reintentos no se presentan como completados", () => {
  assert.deepEqual(certificateHoursProgress(17, 143), { completed: 17, total: 143, percentage: 11 });
  assert.deepEqual(certificateHoursProgress(0, 126), { completed: 0, total: 126, percentage: 0 });
  assert.deepEqual(certificateHoursProgress(200, 143), { completed: 143, total: 143, percentage: 100 });
  assert.equal(certificateHoursProgress(0, 0).percentage, 100);
});

test("la barra comunica conteo, porcentaje y valores accesibles del avance real", () => {
  const html = renderToStaticMarkup(createElement(CertificateHoursProgressBar, certificateHoursProgress(20, 143)));
  assert.match(html, /20 de 143 certificados corregidos/);
  assert.match(html, /13%/);
  assert.match(html, /role="progressbar"/);
  assert.match(html, /aria-valuemax="143"/);
  assert.match(html, /aria-valuenow="20"/);
  assert.match(html, /aria-valuetext="20 de 143 certificados corregidos, 13%"/);
  assert.equal(renderToStaticMarkup(createElement(CertificateHoursProgressBar, certificateHoursProgress(0, 0))), "");
});
