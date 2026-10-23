import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { decodePDFRawStream, PDFArray, PDFDocument, PDFRawStream } from "pdf-lib";

import { generateCertificatePdf } from "../../src/features/certificates/services/generate-certificate-pdf";
import { speakerCertificateRecipientSchema } from "../../src/features/certificates/schemas/speaker-certificate.schema";
import { certificateAccessCertificateRowSchema } from "../../src/features/certificates/schemas/certificate-access.schema";

test("la bitácora de accesos acepta certificados de ponente sin persona ni DNI", () => {
  assert.equal(certificateAccessCertificateRowSchema.safeParse({
    id: "d1800000-0000-4000-8000-000000000001", person_id: null,
    certificate_code: "CCI-PON-2026-000001", participant_name_snapshot: "Ana Pérez", title_snapshot: "Encuentro",
  }).success, true);
});

test("genera PDF de ponente sin horas usando la plantilla institucional", async () => {
  const bytes = await generateCertificatePdf({
    academicHours: null, accessUrl: "https://example.test/certificados/token",
    certificateCode: "CCI-PON-2026-000001", certificateType: "activity", recipientType: "speaker",
    condition: "Panelista", dateText: "22/10/2026", participantName: "Ana Pérez",
    signers: [], title: "Encuentro empresarial",
  });
  const pdf = await PDFDocument.load(bytes);
  assert.equal(pdf.getPageCount(), 1);
  assert.ok(bytes.length > 1000);
  const contents = pdf.getPage(0).node.Contents();
  assert.ok(contents instanceof PDFArray);
  const text = Array.from({ length: contents.size() }, (_, index) => {
    const stream = contents.lookup(index);
    assert.ok(stream instanceof PDFRawStream);
    const source = Buffer.from(decodePDFRawStream(stream).decode()).toString();
    return [...source.matchAll(/<([0-9a-f]+)>\s*Tj/gi)].map((match) => Buffer.from(match[1], "hex").toString("latin1")).join(" ");
  }).join(" ");
  assert.match(text, /En reconocimiento/);
  assert.match(text, /Panelista/);
  assert.doesNotMatch(text, /horas acad/);
});

test("valida roles y referencias antes de emitir", () => {
  assert.equal(speakerCertificateRecipientSchema.safeParse({ role: "", speakerId: "fake" }).success, false);
  assert.equal(speakerCertificateRecipientSchema.safeParse({ role: "x".repeat(121), speakerId: "d1800000-0000-4000-8000-000000000001" }).success, false);
  assert.equal(speakerCertificateRecipientSchema.parse({ role: " Panelista ", speakerId: "d1800000-0000-4000-8000-000000000001" }).role, "Panelista");
});

test("admite un nombre completo específico del certificado y conserva clientes anteriores", () => {
  const base = { role: "Ponente", speakerId: "d1800000-0000-4000-8000-000000000001" };
  assert.equal(speakerCertificateRecipientSchema.parse(base).fullName, undefined);
  assert.equal(speakerCertificateRecipientSchema.parse({ ...base, fullName: " Ana María Pérez " }).fullName, "Ana María Pérez");
  assert.equal(speakerCertificateRecipientSchema.safeParse({ ...base, fullName: "  " }).success, false);
  assert.equal(speakerCertificateRecipientSchema.safeParse({ ...base, fullName: "A".repeat(242) }).success, false);
});

test("el correo de ponente reconoce su rol sin ofrecer pagos ni inscripción", () => {
  const source = readFileSync("docs/integraciones/n8n-preparar-correo.js", "utf8");
  const run = new Function("$json", source);
  const result = run({ event_type: "speaker_certificate_issued", notification_id: "notification", recipient_email: "ponente@example.test", payload: {
    activity_title: "Encuentro <CCI>", participant_name: "Ana Pérez", condition: "Panelista",
    certificate_code: "CCI-PON-2026-000001", certificate_url: "https://example.test/certificados/token",
  } });
  assert.match(result[0].json.html, /valiosa participación como/);
  assert.match(result[0].json.html, /Panelista/);
  assert.match(result[0].json.html, /Encuentro &lt;CCI&gt;/);
  assert.doesNotMatch(result[0].json.html, /Solicitar mi certificado|pago pendiente|inscripción confirmada|horas académicas/);
});
