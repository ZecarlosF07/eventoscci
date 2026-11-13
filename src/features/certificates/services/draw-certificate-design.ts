import { rgb, StandardFonts } from "pdf-lib";
import type { PDFDocument, PDFPage } from "pdf-lib";

import { embedCertificateRaster } from "@/features/certificates/services/embed-certificate-raster";
import type { CertificateDocumentInput } from "@/features/certificates/types/certificate.types";
import { resolveCertificateRecognition } from "@/features/certificates/utils/certificate-design-text";
import { certificateSignerSlots, fitCertificateText } from "@/features/certificates/utils/certificate-pdf-layout";

const INK = rgb(0.13, 0.19, 0.17);

export async function drawCertificateDesign(pdf: PDFDocument, page: PDFPage, input: CertificateDocumentInput) {
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const display = await pdf.embedFont(StandardFonts.TimesRomanBoldItalic);
  const center = page.getWidth() / 2;
  const draw = (wrapped: string[], size: number, y: number, font = regular, x = center) => {
    wrapped.forEach((line, index) => page.drawText(line, {
      color: INK, font, size, x: x - font.widthOfTextAtSize(line, size) / 2, y: y - index * (size + 4),
    }));
    return y - wrapped.length * (size + 4);
  };
  const heading = input.heading?.trim() || "La Cámara de Comercio de Ica otorga el presente certificado a:";
  const condition = input.condition?.trim() || (input.recipientType === "speaker" ? "Ponente" : "Participó");
  const recognition = input.recognition?.trim()
    ? resolveCertificateRecognition(input.recognition, condition, input.title)
    : input.recipientType === "speaker"
      ? `En reconocimiento a su valiosa participación como ${condition} en ${input.title}.`
      : `Por haber cumplido satisfactoriamente la condición de ${condition} en ${input.title}.`;
  const blocks = [
    { text: heading, font: regular, width: 430, lines: 3, preferred: 12, minimum: 10, label: "El encabezado", gap: 20 },
    { text: input.title, font: display, width: 430, lines: 5, preferred: 27, minimum: 16, label: "El título", gap: 19 },
    { text: input.participantName, font: bold, width: 430, lines: 4, preferred: 22, minimum: 13, label: "El nombre del destinatario", gap: 13 },
    { text: recognition, font: regular, width: 410, lines: 9, preferred: 12, minimum: 9, label: "El reconocimiento", gap: 8 },
  ];
  if (input.recipientType !== "speaker" && input.academicHours !== null) {
    blocks.push({ text: `${input.academicHours} horas académicas`, font: bold, width: 410, lines: 1,
      preferred: 11, minimum: 10, label: "Las horas académicas", gap: 8 });
  }
  if (input.certificateType !== "course" && input.dateText) {
    blocks.push({ text: `Ica, ${input.dateText}`, font: regular, width: 410, lines: 2, preferred: 11,
      minimum: 10, label: "Las fechas", gap: 4 });
  }
  const signers = input.signers.toSorted((a, b) => a.sort_order - b.sort_order);
  const slots = certificateSignerSlots(signers.length);
  const textTop = 711;
  const availableHeight = textTop - slots[0].top - 10;
  // Fit the entire text area before drawing, keeping the signature positions fixed.
  const fitBlocks = (compact: boolean) => blocks.map((block) => {
    const [lines, size] = fitCertificateText(block.text, block.font, block.width, block.lines,
      compact ? block.minimum : block.preferred, block.minimum, block.label);
    const gap = compact ? Math.min(block.gap, 8) : block.gap;
    return { ...block, lines, size, gap, height: lines.length * (size + 4) + gap };
  });
  const fits = (layout: ReturnType<typeof fitBlocks>) => layout.reduce((total, block) => total + block.height, 0) <= availableHeight;
  let textLayout = fitBlocks(false);
  if (!fits(textLayout)) textLayout = fitBlocks(true);
  if (!fits(textLayout)) throw new Error("El texto invade las firmas. Acorta el encabezado o el reconocimiento.");
  let y = textTop;
  for (const block of textLayout) y = draw(block.lines, block.size, y, block.font) - block.gap;
  for (const [index, signer] of signers.entries()) {
    const { centerX, top, width } = slots[index];
    if (signer.signatureBytes) {
      const image = await embedCertificateRaster(pdf, signer.signatureBytes);
      const scale = Math.min(Math.min(126, width) / image.width, 38 / image.height);
      page.drawImage(image, { width: image.width * scale, height: image.height * scale,
        x: centerX - image.width * scale / 2, y: top - 39 });
    }
    page.drawLine({ color: INK, start: { x: centerX - width / 2, y: top - 43 },
      end: { x: centerX + width / 2, y: top - 43 }, thickness: 0.55 });
    const [name, nameSize] = fitCertificateText(signer.signer_name, bold, width, 2, 10, 8, `El nombre del firmante ${index + 1}`);
    const [title, titleSize] = fitCertificateText(signer.signer_title ?? "", regular, width, 2, 9, 7.5, `El cargo del firmante ${index + 1}`);
    const next = draw(name, nameSize, top - 55, bold, centerX);
    draw(title, titleSize, next - 1, regular, centerX);
  }
}
