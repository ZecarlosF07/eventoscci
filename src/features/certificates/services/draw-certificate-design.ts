import { rgb, StandardFonts } from "pdf-lib";
import type { PDFDocument, PDFFont, PDFPage } from "pdf-lib";

import { embedCertificateRaster } from "@/features/certificates/services/embed-certificate-raster";
import type { CertificateDocumentFonts, CertificateDocumentInput } from "@/features/certificates/types/certificate.types";
import { resolveCertificateRecognition } from "@/features/certificates/utils/certificate-design-text";
import { certificateSignerSlots, fitCertificateText } from "@/features/certificates/utils/certificate-pdf-layout";

const INK = rgb(0.13, 0.19, 0.17);
const SINGLE_SPEAKER_BODY_TOP = 640;
const SINGLE_SPEAKER_BODY_TOP_WITH_MASTHEAD = 590;
const SINGLE_SPEAKER_BODY_LIMIT_WITH_MASTHEAD = 598;
const SINGLE_SPEAKER_TEXT_BOTTOM_WITH_DATE = 266;
const SINGLE_SPEAKER_TEXT_BOTTOM_WITHOUT_DATE = 323;
const SINGLE_SPEAKER_NAME_GAP = 38;
const SINGLE_SPEAKER_NAME_INDEX = 1;
const SINGLE_SPEAKER_UNDERLINE_GAP = 12;
// Extra space follows the heading, name and activity title. Keep the recognition attached to the title.
const SINGLE_SPEAKER_GAP_WEIGHTS_WITH_DATE = [0.65, 0.16, 0, 0.19];
const SINGLE_SPEAKER_GAP_WEIGHTS_WITHOUT_DATE = [0.72, 0.28];
export const SINGLE_SPEAKER_SIGNATURE_TOP = 231;

function drawCenteredLines(page: PDFPage, lines: string[], font: PDFFont, size: number, y: number, center: number) {
  lines.forEach((line, index) => page.drawText(line, {
    color: INK, font, size, x: center - font.widthOfTextAtSize(line, size) / 2, y: y - index * (size + 4),
  }));
  return y - lines.length * (size + 4);
}

function drawSpeakerMasthead(page: PDFPage, font: PDFFont, center: number) {
  const top = page.getHeight();
  const title = "Certificado";
  const subtitle = "de Reconocimiento";
  const titleSize = 58;
  const titleWidth = font.widthOfTextAtSize(title, titleSize);
  const subtitleSize = titleWidth / font.widthOfTextAtSize(subtitle, 1);
  drawCenteredLines(page, [title], font, titleSize, top - 134, center);
  drawCenteredLines(page, [subtitle], font, subtitleSize, top - 178, center);
}

export async function drawCertificateBody(pdf: PDFDocument, page: PDFPage, input: CertificateDocumentInput, signatureTop: number, fonts: CertificateDocumentFonts) {
  const { regular, bold, emphasis, masthead } = fonts;
  const isSpeaker = input.recipientType === "speaker";
  const singleSpeaker = isSpeaker && input.signers.length === 1;
  const heading = input.heading?.trim() || "La Cámara de Comercio de Ica otorga el presente certificado a:";
  const condition = input.condition?.trim() || (isSpeaker ? "Ponente" : "Participó");
  const blocks = [
    { text: heading, font: regular, width: 430, lines: 3, preferred: 12, minimum: 10, label: "El encabezado", gap: isSpeaker ? 29 : 20 },
  ];
  if (isSpeaker) {
    const role = condition.toLowerCase() === "ponente" ? "ponente" : condition;
    blocks.push(
      { text: input.participantName, font: emphasis, width: 470, lines: 4, preferred: 29, minimum: 22, label: "El nombre del ponente", gap: singleSpeaker ? SINGLE_SPEAKER_NAME_GAP : 19 },
      { text: `En reconocimiento a su valiosa participación como ${role} en:`, font: regular, width: 410, lines: 4, preferred: 13, minimum: 11, label: "El reconocimiento del ponente", gap: 3 },
      { text: input.title, font: emphasis, width: 410, lines: 6, preferred: 17, minimum: 12, label: "El título", gap: 20 },
    );
  } else {
    const display = await pdf.embedFont(StandardFonts.TimesRomanBoldItalic);
    const recognition = input.recognition?.trim()
      ? resolveCertificateRecognition(input.recognition, condition, input.title)
      : `Por haber cumplido satisfactoriamente la condición de ${condition} en ${input.title}.`;
    blocks.push(
      { text: input.title, font: display, width: 430, lines: 5, preferred: 27, minimum: 16, label: "El título", gap: 19 },
      { text: input.participantName, font: bold, width: 430, lines: 4, preferred: 22, minimum: 13, label: "El nombre del destinatario", gap: 13 },
      { text: recognition, font: regular, width: 410, lines: 9, preferred: 12, minimum: 9, label: "El reconocimiento", gap: 8 },
    );
  }
  if (!isSpeaker && input.academicHours !== null) {
    blocks.push({ text: `${input.academicHours} horas académicas`, font: bold, width: 410, lines: 1,
      preferred: 11, minimum: 10, label: "Las horas académicas", gap: 8 });
  }
  const date = input.certificateType !== "course" ? input.dateText : null;
  if (date) {
    blocks.push({ text: `Ica, ${date}`, font: regular, width: 410, lines: 2, preferred: 11,
      minimum: 10, label: "Las fechas", gap: 4 });
  }
  const standardTextTop = masthead ? SINGLE_SPEAKER_BODY_LIMIT_WITH_MASTHEAD : isSpeaker ? 695 : 711;
  const minimumTextBottom = signatureTop + 10;
  const availableHeight = standardTextTop - minimumTextBottom;
  // Fit before placing the text, so long names and titles can start higher when needed.
  const fitBlocks = (compact: boolean) => blocks.map((block) => {
    const [lines, size] = fitCertificateText(block.text, block.font, block.width, block.lines,
      compact ? block.minimum : block.preferred, block.minimum, block.label);
    const gap = compact ? Math.min(block.gap, 8) : block.gap;
    return { ...block, lines, size, gap, height: lines.length * (size + 4) + gap };
  });
  const layoutHeight = (layout: ReturnType<typeof fitBlocks>) => layout.reduce((total, block) => total + block.height, 0);
  const preferredLayout = fitBlocks(false);
  const textLayout = layoutHeight(preferredLayout) <= availableHeight ? preferredLayout : fitBlocks(true);
  const contentHeight = layoutHeight(textLayout);
  if (contentHeight > availableHeight) throw new Error(isSpeaker
    ? "El texto invade las firmas. Acorta el encabezado, el nombre o el título."
    : "El texto invade las firmas. Acorta el encabezado o el reconocimiento.");
  const center = page.getWidth() / 2;
  if (masthead) drawSpeakerMasthead(page, masthead, center);
  const gapWeights = date ? SINGLE_SPEAKER_GAP_WEIGHTS_WITH_DATE : SINGLE_SPEAKER_GAP_WEIGHTS_WITHOUT_DATE;
  const preferredBottom = date ? SINGLE_SPEAKER_TEXT_BOTTOM_WITH_DATE : SINGLE_SPEAKER_TEXT_BOTTOM_WITHOUT_DATE;
  const preferredTop = masthead ? SINGLE_SPEAKER_BODY_TOP_WITH_MASTHEAD : SINGLE_SPEAKER_BODY_TOP;
  const extraSpace = singleSpeaker ? Math.max(0, preferredTop - preferredBottom - contentHeight) : 0;
  let y = singleSpeaker ? Math.max(preferredTop, minimumTextBottom + contentHeight) : standardTextTop;
  for (const [index, block] of textLayout.entries()) {
    const nextY = drawCenteredLines(page, block.lines, block.font, block.size, y, center);
    if (singleSpeaker && index === SINGLE_SPEAKER_NAME_INDEX && block.lines.length > 0) {
      const lastNameBaseline = nextY + block.size + 4;
      const underlineY = lastNameBaseline - SINGLE_SPEAKER_UNDERLINE_GAP;
      page.drawLine({
        start: { x: center - block.width / 2, y: underlineY },
        end: { x: center + block.width / 2, y: underlineY },
        color: INK, opacity: 0.45, thickness: 0.65,
      });
    }
    const gap = block.gap + extraSpace * (gapWeights[index] ?? 0);
    y = nextY - gap;
  }
}

export async function drawCertificateDesign(pdf: PDFDocument, page: PDFPage, input: CertificateDocumentInput, fonts: CertificateDocumentFonts) {
  const signers = input.signers.toSorted((a, b) => a.sort_order - b.sort_order);
  const slots = certificateSignerSlots(signers.length);
  const singleSpeaker = input.recipientType === "speaker" && signers.length === 1;
  await drawCertificateBody(pdf, page, input, singleSpeaker ? SINGLE_SPEAKER_SIGNATURE_TOP : slots[0].top, fonts);
  const { regular, bold } = fonts;
  for (const [index, signer] of signers.entries()) {
    const { centerX, top: standardTop, width } = slots[index];
    const top = singleSpeaker ? SINGLE_SPEAKER_SIGNATURE_TOP : standardTop;
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
    const next = drawCenteredLines(page, name, bold, nameSize, top - 55, centerX);
    drawCenteredLines(page, title, regular, titleSize, next - 1, centerX);
  }
}
