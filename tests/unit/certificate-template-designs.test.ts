import assert from "node:assert/strict";
import test from "node:test";

import { PDFDocument, StandardFonts } from "pdf-lib";
import sharp from "sharp";

import { generateCertificatePdf } from "@/features/certificates/services/generate-certificate-pdf";
import type { CertificateDocumentInput, CertificateTemplate } from "@/features/certificates/types/certificate.types";
import { isCertificateRecognitionValid, resolveCertificateRecognition } from "@/features/certificates/utils/certificate-design-text";
import { certificateSignerSlots, fitCertificateText } from "@/features/certificates/utils/certificate-pdf-layout";
import { templatesForRecipient } from "@/features/certificates/utils/certificate-template-audience";

test("prioritizes specific defaults and retains shared models", () => {
  const model: CertificateTemplate = {
    id: "shared", name: "Compartido", scope: "activity", audience: null, background_path: null,
    is_active: true, is_default: true, signers: [], template_config: {}, updated_at: "",
  };
  const models: CertificateTemplate[] = [
    model, { ...model, id: "participant", audience: "participant" }, { ...model, id: "speaker", audience: "speaker" },
    { ...model, id: "disabled", audience: "speaker", is_active: false },
    { ...model, id: "student", scope: "course", audience: "student" },
  ];
  assert.deepEqual(templatesForRecipient(models, "speaker").map(({ id }) => id), ["speaker", "shared"]);
  assert.deepEqual(templatesForRecipient(models, "participant").map(({ id }) => id), ["participant", "shared"]);
  assert.deepEqual(templatesForRecipient(models, "student").map(({ id }) => id), ["student"]);
});

test("recognition supports the expected tokens without replacing inserted text again", () => {
  assert.ok(isCertificateRecognitionValid(""));
  assert.ok(isCertificateRecognitionValid("Reconocemos a {{condicion}} en {{titulo}}."));
  assert.ok(!isCertificateRecognitionValid("Reconocemos a {{condicion}} en {{sede}}."));
  assert.ok(!isCertificateRecognitionValid("Actividad {{titulo}}"));
  assert.equal(resolveCertificateRecognition("{{condicion}} en {{titulo}}", "{{titulo}}", "Gestión"), "{{titulo}} en Gestión");
});

test("signature positions are centered, ordered and leave space for the QR", () => {
  assert.equal(certificateSignerSlots(1)[0].centerX, 297.64);
  for (const count of [2, 3, 4]) {
    const slots = certificateSignerSlots(count);
    assert.equal(new Set(slots.map(({ top }) => top)).size, count === 4 ? 2 : 1);
    for (const top of new Set(slots.map((slot) => slot.top))) {
      const row = slots.filter((slot) => slot.top === top);
      assert.ok(row.every((slot, index) => index === 0 || slot.centerX - row[index - 1].centerX > slot.width));
      assert.ok(top - 109 > 98);
    }
  }
  assert.throws(() => certificateSignerSlots(5), /una y cuatro/);
});

test("wraps names without silently clipping text and renders all four PDF configurations", async () => {
  const font = await (await PDFDocument.create()).embedFont(StandardFonts.Helvetica);
  const [lines] = fitCertificateText("María Fernanda García Torres de Mendoza", font, 125, 2, 10, 8, "El nombre");
  assert.equal(lines.join(" "), "María Fernanda García Torres de Mendoza");
  assert.throws(() => fitCertificateText("W".repeat(100), font, 120, 2, 10, 8, "El cargo"), /El cargo no cabe/);
  assert.throws(() => fitCertificateText("Innovación 🚀", font, 200, 2, 12, 9, "El título"), /El título contiene caracteres/);
  assert.deepEqual(fitCertificateText("Mari\u0301a", font, 125, 2, 10, 8, "El nombre")[0], ["María"]);

  const signature = await sharp({
    create: { width: 180, height: 50, channels: 4, background: { r: 14, g: 54, b: 38, alpha: 0.4 } },
  }).webp().toBuffer();
  const sample: CertificateDocumentInput = {
    academicHours: 8, accessUrl: "https://example.invalid/muestra", certificateCode: "CCI-MUESTRA", certificateType: "activity",
    condition: "Participó", dateText: "15 de noviembre de 2026", heading: "Constancia institucional",
    layoutVersion: 2, participantName: "María Fernanda García Torres", recognition: "En reconocimiento a quien {{condicion}} en {{titulo}}.",
    recipientType: "participant", signers: [], title: "Encuentro de innovación y desarrollo empresarial",
  };
  for (const count of [1, 2, 3, 4]) {
    const signers = Array.from({ length: count }, (_, sort_order) => ({
      signatureBytes: signature, signature_path: null, signer_name: "María Fernanda García Torres de Mendoza",
      signer_title: "Dirección de Desarrollo e Innovación Empresarial", sort_order,
    }));
    const pdf = await PDFDocument.load(await generateCertificatePdf({ ...sample, signers, preview: true }));
    assert.equal(pdf.getPageCount(), 1);
  }

  const longDocument = await generateCertificatePdf({
    ...sample, recognition: "",
    heading: "La Cámara de Comercio de Ica se complace en entregar un reconocimiento institucional y deja constancia de la participación en su programa de formación profesional a:",
    title: "Sostenibilidad empresarial, transformación digital y liderazgo. ".repeat(5).slice(0, 300),
    participantName: "María Fernanda García Torres de Mendoza y Hernández de la Cruz ".repeat(3).trim(),
    signers: Array.from({ length: 4 }, (_, sort_order) => ({
      signatureBytes: signature, signature_path: null, signer_name: "María Fernanda García Torres de Mendoza",
      signer_title: "Dirección de Desarrollo e Innovación Empresarial", sort_order,
    })),
  });
  assert.equal((await PDFDocument.load(longDocument)).getPageCount(), 1);
});
