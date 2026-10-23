import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { MyCertificatesList } from "../../src/features/certificates/components/MyCertificatesList/MyCertificatesList";
import { PublicCertificateCard } from "../../src/features/certificates/components/PublicCertificateCard/PublicCertificateCard";
import { myCertificateSchema } from "../../src/features/certificates/schemas/certificate-query.schema";
import { publicCertificateSearchItemSchema } from "../../src/features/certificates/schemas/public-certificate-search.schema";
import { optionalSpeakerDniSchema, speakerDocumentSchema } from "../../src/features/speakers/schemas/speaker-document.schema";

const id = "f4000000-0000-4000-8000-000000000001";
const row = {
  id, access_token: id, academic_hours: null, certificate_code: "CCI-PON-2026-000001",
  certificate_type: "activity", recipient_type: "speaker", condition: "Panelista", date_text: "23/10/2026",
  download_available: true, issued_at: "2026-10-23T15:00:00Z", participant_name: "Ana María Completo",
  revocation_reason: null, status: "issued", title: "Encuentro institucional",
};

test("el DNI del catálogo es opcional y conserva ceros, sin admitir CE ni formatos incompletos", () => {
  assert.equal(optionalSpeakerDniSchema.parse("04180001"), "04180001");
  assert.equal(optionalSpeakerDniSchema.parse(""), "");
  for (const invalid of ["1234567", "123456789", "1234567A", 4180001]) {
    assert.equal(optionalSpeakerDniSchema.safeParse(invalid).success, false);
  }
});

test("el formulario valida identidad esperada y limita el motivo sin aceptar referencias inválidas", () => {
  const input = { confirmHistory: true, documentNumber: "04180002", expectedDocument: "04180001", reason: " Corrección verificada ", speakerId: id };
  assert.equal(speakerDocumentSchema.parse(input).reason, "Corrección verificada");
  assert.equal(speakerDocumentSchema.safeParse({ ...input, reason: "x".repeat(501) }).success, false);
  assert.equal(speakerDocumentSchema.safeParse({ ...input, speakerId: "otro" }).success, false);
});

test("los contratos públicos y del Campus conservan ID, destinatario y nombre impreso", () => {
  assert.equal(publicCertificateSearchItemSchema.parse(row).recipient_type, "speaker");
  const campus = myCertificateSchema.parse({ ...row, course_id: null, file_ready: true });
  assert.equal(campus.participant_name, "Ana María Completo");
  assert.equal(campus.recipient_type, "speaker");
  assert.equal(myCertificateSchema.safeParse({ ...row, recipient_type: "otro", course_id: null, file_ready: true }).success, false);
  assert.equal("document_number" in publicCertificateSearchItemSchema.parse({ ...row, document_number: "04180001" }), false);
});

test("la tarjeta pública distingue al ponente, rol y nombre sin mostrar DNI ni horas", () => {
  const certificate = publicCertificateSearchItemSchema.parse(row);
  const html = renderToStaticMarkup(createElement(PublicCertificateCard, { certificate }));
  assert.match(html, /Ponente/);
  assert.match(html, /Panelista/);
  assert.match(html, /Ana María Completo/);
  assert.match(html, /Descargar PDF/);
  assert.doesNotMatch(html, /Horas académicas|04180001/);
  const revoked = renderToStaticMarkup(createElement(PublicCertificateCard, { certificate: { ...certificate, download_available: false, status: "revoked" } }));
  assert.match(revoked, /Revocado/);
  assert.doesNotMatch(revoked, /Descargar PDF/);
});

test("Mis certificados presenta el rol y el nombre del snapshot del ponente", () => {
  const html = renderToStaticMarkup(createElement(MyCertificatesList, { certificates: [{
    id, accessToken: id, academicHours: null, certificateCode: row.certificate_code,
    certificateType: "activity", condition: "Panelista", courseId: null, fileReady: true,
    issuedAt: row.issued_at, participantName: "Ana María Completo", recipientType: "speaker",
    revocationReason: null, status: "issued", title: row.title,
  }] }));
  assert.match(html, /Ponente/);
  assert.match(html, /Panelista/);
  assert.match(html, /Ana María Completo/);
  assert.match(html, /Descargar PDF/);
});

test("el editor usa diálogo nativo, motivo, confirmación explícita y comparación contra el documento anterior", () => {
  const source = readFileSync("src/features/speakers/components/SpeakerDocumentEditor/SpeakerDocumentEditor.tsx", "utf8");
  assert.match(source, /showModal\(\)/);
  assert.match(source, /aria-labelledby/);
  assert.match(source, /expected_document/);
  assert.match(source, /confirm_history/);
  assert.match(source, /name="reason"/);
  assert.match(source, /todo el historial dejará de estar asociado/);
  assert.match(source, /event.stopPropagation\(\)/);
  assert.match(source, /trigger.current\?\.focus\(\)/);
});
