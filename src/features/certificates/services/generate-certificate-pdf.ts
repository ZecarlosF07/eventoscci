import { readFile } from "node:fs/promises";
import path from "node:path";

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";

import type { CertificateDocumentInput, CertificateDocumentSigner } from "@/features/certificates/types/certificate.types";
import { centeredTextX, wrapPdfText } from "@/features/certificates/utils/certificate-pdf-layout";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const TEXT_COLOR = rgb(0.27, 0.29, 0.29);
const DARK_COLOR = rgb(0.04, 0.15, 0.13);

async function bundledBackground(): Promise<Uint8Array> {
  const assetPath = path.join(process.cwd(), "public", "assets", "certificates", "cci-activity-certificate-background.png");
  return readFile(assetPath);
}

async function embedRaster(pdf: PDFDocument, bytes: Uint8Array) {
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50;
  return isPng ? pdf.embedPng(bytes) : pdf.embedJpg(bytes);
}

async function drawSigner(
  pdf: PDFDocument,
  page: ReturnType<PDFDocument["addPage"]>,
  signer: CertificateDocumentSigner,
  centerX: number,
  y: number,
): Promise<void> {
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  if (signer.signatureBytes) {
    const signature = await embedRaster(pdf, signer.signatureBytes);
    const scale = Math.min(120 / signature.width, 45 / signature.height);
    page.drawImage(signature, { height: signature.height * scale, width: signature.width * scale, x: centerX - (signature.width * scale) / 2, y: y + 30 });
  }
  page.drawLine({ color: TEXT_COLOR, start: { x: centerX - 75, y: y + 26 }, end: { x: centerX + 75, y: y + 26 }, thickness: 0.7 });
  page.drawText(signer.signer_name, { color: TEXT_COLOR, font: regular, size: 10, x: centerX - regular.widthOfTextAtSize(signer.signer_name, 10) / 2, y: y + 12 });
  if (signer.signer_title) page.drawText(signer.signer_title, { color: TEXT_COLOR, font: bold, size: 9, x: centerX - bold.widthOfTextAtSize(signer.signer_title, 9) / 2, y });
}

export async function generateCertificatePdf(input: CertificateDocumentInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const titleFont = await pdf.embedFont(StandardFonts.TimesRomanBoldItalic);
  const background = await embedRaster(pdf, input.backgroundBytes ?? await bundledBackground());
  page.drawImage(background, { height: PAGE_HEIGHT, width: PAGE_WIDTH, x: 0, y: 0 });

  const intro = "La Cámara de Comercio de Ica otorga el presente certificado a:";
  page.drawText(intro, { color: TEXT_COLOR, font: regular, size: 11, x: centeredTextX(intro, regular, 11, PAGE_WIDTH), y: 690 });

  const titleLines = wrapPdfText(input.title, titleFont, 27, 390).slice(0, 3);
  titleLines.forEach((line, index) => page.drawText(line, { color: TEXT_COLOR, font: titleFont, size: 27, x: centeredTextX(line, titleFont, 27, PAGE_WIDTH), y: 645 - index * 31 }));

  const nameY = 535 - Math.max(0, titleLines.length - 1) * 16;
  const nameSize = input.participantName.length > 40 ? 19 : 22;
  page.drawText(input.participantName, { color: DARK_COLOR, font: bold, size: nameSize, x: centeredTextX(input.participantName, bold, nameSize, PAGE_WIDTH), y: nameY });
  page.drawLine({ color: TEXT_COLOR, start: { x: 95, y: nameY - 10 }, end: { x: 500, y: nameY - 10 }, thickness: 0.8 });

  const condition = input.condition?.trim() || "Participó";
  const description = `Por haber cumplido satisfactoriamente la condición de ${condition} en ${input.title}.`;
  const descriptionLines = wrapPdfText(description, regular, 12, 385).slice(0, 4);
  descriptionLines.forEach((line, index) => page.drawText(line, { color: TEXT_COLOR, font: regular, size: 12, x: centeredTextX(line, regular, 12, PAGE_WIDTH), y: nameY - 48 - index * 17 }));

  const detailY = nameY - 48 - descriptionLines.length * 17 - 8;
  if (input.academicHours !== null) {
    const hours = `${input.academicHours} horas académicas`;
    page.drawText(hours, { color: TEXT_COLOR, font: bold, size: 11, x: centeredTextX(hours, bold, 11, PAGE_WIDTH), y: detailY });
  }
  // Los cursos del campus son virtuales y no gestionan un rango de fechas.
  // Esta regla vive también en el generador para que ningún flujo futuro pueda
  // incluir una fecha de curso por accidente.
  if (input.certificateType !== "course" && input.dateText) {
    const date = `Ica, ${input.dateText}`;
    page.drawText(date, { color: TEXT_COLOR, font: regular, size: 11, x: centeredTextX(date, regular, 11, PAGE_WIDTH), y: detailY - 25 });
  }

  const signerCount = Math.min(input.signers.length, 3);
  const signerWidth = 390 / Math.max(1, signerCount);
  for (let index = 0; index < signerCount; index += 1) {
    await drawSigner(pdf, page, input.signers[index], 102 + signerWidth * (index + 0.5), 190);
  }

  const qrDataUrl = await QRCode.toDataURL(input.accessUrl, { errorCorrectionLevel: "M", margin: 1, width: 240 });
  const qr = await pdf.embedPng(Uint8Array.from(Buffer.from(qrDataUrl.split(",")[1], "base64")));
  page.drawText("Verifica la autenticidad", { color: TEXT_COLOR, font: regular, size: 7, x: 472, y: 98 });
  page.drawImage(qr, { height: 62, width: 62, x: 478, y: 31 });
  page.drawText(input.certificateCode, { color: DARK_COLOR, font: bold, size: 8, x: centeredTextX(input.certificateCode, bold, 8, PAGE_WIDTH), y: 38 });
  page.drawText("Documento emitido digitalmente por la Cámara de Comercio de Ica", { color: TEXT_COLOR, font: regular, size: 6.5, x: centeredTextX("Documento emitido digitalmente por la Cámara de Comercio de Ica", regular, 6.5, PAGE_WIDTH), y: 24 });
  return pdf.save();
}
