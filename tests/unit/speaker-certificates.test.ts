import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { decodePDFRawStream, PDFArray, PDFDict, PDFDocument, PDFName, PDFRawStream } from "pdf-lib";

import { generateCertificatePdf } from "../../src/features/certificates/services/generate-certificate-pdf";
import { speakerCertificateRecipientSchema } from "../../src/features/certificates/schemas/speaker-certificate.schema";
import { certificateAccessCertificateRowSchema } from "../../src/features/certificates/schemas/certificate-access.schema";

function readEmbeddedTextRuns(pdf: PDFDocument) {
  const page = pdf.getPage(0);
  const contents = page.node.Contents();
  const resources = page.node.Resources();
  assert.ok(contents instanceof PDFArray && resources);
  const fonts = resources.lookup(PDFName.of("Font"), PDFDict);
  return Array.from({ length: contents.size() }, (_, index) => {
    const stream = contents.lookup(index, PDFRawStream);
    const source = Buffer.from(decodePDFRawStream(stream).decode()).toString();
    return [...source.matchAll(/\/([\w-]+) ([\d.]+) Tf\b[^<]*<([0-9a-f]+)>\s*Tj/gi)].map(([, fontKey, size, hex]) => {
      const font = fonts.lookup(PDFName.of(fontKey), PDFDict);
      const unicode = font.lookup(PDFName.of("ToUnicode"));
      assert.ok(unicode instanceof PDFRawStream);
      const mapping = Buffer.from(decodePDFRawStream(unicode).decode()).toString();
      const glyphs = new Map([...mapping.matchAll(/^<([0-9a-f]{4})> <([0-9a-f]+)>$/gim)].map(([, id, value]) => [
        id.toUpperCase(), Buffer.from(value, "hex").swap16().toString("utf16le"),
      ]));
      const text = hex.match(/.{4}/g)?.map((glyph) => glyphs.get(glyph.toUpperCase()) ?? "\uFFFD").join("") ?? "";
      return { font: font.lookup(PDFName.of("BaseFont"), PDFName).decodeText(), size: Number(size), text };
    });
  }).flat();
}

test("la bitácora de accesos acepta certificados de ponente sin persona ni DNI", () => {
  assert.equal(certificateAccessCertificateRowSchema.safeParse({
    id: "d1800000-0000-4000-8000-000000000001", person_id: null,
    certificate_code: "CCI-PON-2026-000001", participant_name_snapshot: "Ana Pérez", title_snapshot: "Encuentro",
  }).success, true);
});

test("destaca el nombre del ponente y muestra su rol y el título una sola vez en ambos diseños", async () => {
  for (const layoutVersion of [1, 2]) {
    const condition = layoutVersion === 1 ? null : "Panelista";
    const bytes = await generateCertificatePdf({
      academicHours: null, accessUrl: "https://example.test/certificados/token",
      certificateCode: "CCI-PON-2026-000001", certificateType: "activity", recipientType: "speaker",
      condition, dateText: "22/10/2026", layoutVersion, participantName: "Ana Pérez",
      recognition: "Reconocemos a {{condicion}} en {{titulo}}.",
      signers: [{ signature_path: null, signer_name: "Firma institucional", signer_title: null, sort_order: 0 }],
      title: "Encuentro empresarial",
    });
    const pdf = await PDFDocument.load(bytes);
    assert.equal(pdf.getPageCount(), 1);
    const textRuns = readEmbeddedTextRuns(pdf);
    assert.deepEqual(textRuns.slice(0, 2).map((run) => run.text), ["Certificado", "de Reconocimiento"]);
    assert.ok(textRuns.slice(0, 2).every((run) => /^CharisSIL-Italic/.test(run.font)));
    const text = textRuns.map((run) => run.text).join(" ");
    const role = condition ?? "ponente";
    assert.ok(text.includes(`Ana Pérez En reconocimiento a su valiosa participación como ${role} en: Encuentro empresarial Ica, 22/10/2026`));
    assert.equal(textRuns.filter((run) => run.text === "Encuentro empresarial").length, 1);
    assert.doesNotMatch(text, /horas acad|Reconocemos/);
    const name = textRuns.find((run) => run.text === "Ana Pérez");
    const title = textRuns.find((run) => run.text === "Encuentro empresarial");
    const recognition = textRuns.find((run) => run.text.startsWith("En reconocimiento"));
    assert.ok(name && title && name.size > title.size);
    assert.match(name.font, /^CharisSIL-Bold/);
    assert.match(title.font, /^CharisSIL-Bold/);
    assert.match(recognition?.font ?? "", /^Inter-Regular/);
  }
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
