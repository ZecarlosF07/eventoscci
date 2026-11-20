import { readFile } from "node:fs/promises";
import path from "node:path";

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";

import { drawCertificateBody, drawCertificateDesign, SINGLE_SPEAKER_SIGNATURE_TOP } from "@/features/certificates/services/draw-certificate-design";
import { embedCertificateFonts } from "@/features/certificates/services/embed-certificate-fonts";
import { embedCertificateRaster } from "@/features/certificates/services/embed-certificate-raster";
import type { CertificateDocumentFonts, CertificateDocumentInput, CertificateDocumentSigner } from "@/features/certificates/types/certificate.types";
import {
  centeredTextX,
  fitPdfTextSize,
  fitWrappedPdfText,
  wrapPdfText,
} from "@/features/certificates/utils/certificate-pdf-layout";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const TEXT_COLOR = rgb(0.27, 0.29, 0.29);
const DARK_COLOR = rgb(0.04, 0.15, 0.13);
const LEGACY_SIGNER_Y = 190;
const LEGACY_SIGNATURE_HEIGHT = 45;
const LEGACY_SIGNATURE_OFFSET = 30;
const LEGACY_SIGNATURE_TOP = LEGACY_SIGNER_Y + LEGACY_SIGNATURE_OFFSET + LEGACY_SIGNATURE_HEIGHT;

async function bundledBackground(): Promise<Uint8Array> {
  const assetPath = path.join(process.cwd(), "public", "assets", "certificates", "cci-activity-certificate-background.png");
  return readFile(assetPath);
}

async function drawSigner(
  pdf: PDFDocument,
  page: ReturnType<PDFDocument["addPage"]>,
  signer: CertificateDocumentSigner,
  centerX: number,
  y: number,
  { regular, bold }: CertificateDocumentFonts,
): Promise<void> {
  if (signer.signatureBytes) {
    const signature = await embedCertificateRaster(pdf, signer.signatureBytes);
    const scale = Math.min(120 / signature.width, LEGACY_SIGNATURE_HEIGHT / signature.height);
    page.drawImage(signature, { height: signature.height * scale, width: signature.width * scale, x: centerX - (signature.width * scale) / 2, y: y + LEGACY_SIGNATURE_OFFSET });
  }
  page.drawLine({ color: TEXT_COLOR, start: { x: centerX - 75, y: y + 26 }, end: { x: centerX + 75, y: y + 26 }, thickness: 0.7 });
  page.drawText(signer.signer_name, { color: TEXT_COLOR, font: regular, size: 10, x: centerX - regular.widthOfTextAtSize(signer.signer_name, 10) / 2, y: y + 12 });
  if (signer.signer_title) page.drawText(signer.signer_title, { color: TEXT_COLOR, font: bold, size: 9, x: centerX - bold.widthOfTextAtSize(signer.signer_title, 9) / 2, y });
}

export async function generateCertificatePdf(input: CertificateDocumentInput): Promise<Uint8Array> {
  if (input.certificateType === "activity" && input.recipientType !== "speaker" && (input.academicHours === null || !Number.isFinite(input.academicHours) || input.academicHours <= 0)) {
    throw new Error("ACADEMIC_HOURS_REQUIRED");
  }
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const fonts = await embedCertificateFonts(pdf, input);
  const { regular, bold } = fonts;
  const background = await embedCertificateRaster(pdf, input.backgroundBytes ?? await bundledBackground());
  page.drawImage(background, { height: PAGE_HEIGHT, width: PAGE_WIDTH, x: 0, y: 0 });

  if (input.layoutVersion === 2) {
    await drawCertificateDesign(pdf, page, input, fonts);
  } else {
    await drawLegacyContent(pdf, page, input, fonts);
  }

  const qrBytes = await QRCode.toBuffer(input.accessUrl, input.layoutVersion === 2
    ? { errorCorrectionLevel: "M", margin: 4, scale: 8 }
    : { errorCorrectionLevel: "M", margin: 1, width: 240 });
  const qr = await pdf.embedPng(qrBytes);
  page.drawText(input.preview ? "QR de muestra" : "Verifica la autenticidad", { color: TEXT_COLOR, font: regular, size: 7, x: 472, y: 98 });
  page.drawImage(qr, { height: 62, width: 62, x: 478, y: 31 });
  page.drawText(input.certificateCode, { color: DARK_COLOR, font: bold, size: 8, x: centeredTextX(input.certificateCode, bold, 8, PAGE_WIDTH), y: 38 });
  const footer = input.preview ? "Muestra · no válido" : "Documento emitido digitalmente por la Cámara de Comercio de Ica";
  page.drawText(footer, { color: input.preview ? DARK_COLOR : TEXT_COLOR, font: regular, size: input.preview ? 12 : 6.5,
    x: centeredTextX(footer, regular, input.preview ? 12 : 6.5, PAGE_WIDTH), y: 24 });
  return pdf.save();
}

async function drawLegacyContent(pdf: PDFDocument, page: ReturnType<PDFDocument["addPage"]>, input: CertificateDocumentInput, fonts: CertificateDocumentFonts) {
  const singleSpeaker = input.recipientType === "speaker" && input.signers.length === 1;
  const signatureTop = singleSpeaker ? SINGLE_SPEAKER_SIGNATURE_TOP : LEGACY_SIGNATURE_TOP;
  if (input.recipientType === "speaker") {
    await drawCertificateBody(pdf, page, input, signatureTop, fonts);
  } else {
    await drawLegacyBody(pdf, page, input, fonts);
  }
  const signerY = LEGACY_SIGNER_Y + signatureTop - LEGACY_SIGNATURE_TOP;
  const signerCount = Math.min(input.signers.length, 3);
  const signerWidth = 390 / Math.max(1, signerCount);
  for (let index = 0; index < signerCount; index += 1) {
    await drawSigner(pdf, page, input.signers[index], 102 + signerWidth * (index + 0.5), signerY, fonts);
  }
}

async function drawLegacyBody(pdf: PDFDocument, page: ReturnType<PDFDocument["addPage"]>, input: CertificateDocumentInput, { regular, bold }: CertificateDocumentFonts) {
  const titleFont = await pdf.embedFont(StandardFonts.TimesRomanBoldItalic);
  const intro = "La Cámara de Comercio de Ica otorga el presente certificado a:";
  page.drawText(intro, { color: TEXT_COLOR, font: regular, size: 11, x: centeredTextX(intro, regular, 11, PAGE_WIDTH), y: 690 });

  const [titleLines, titleSize] = fitWrappedPdfText(input.title, titleFont, 410, 4, 27, 20);
  const titleLineHeight = titleSize + 4;
  titleLines.forEach((line, index) => page.drawText(line, { color: TEXT_COLOR, font: titleFont, size: titleSize, x: centeredTextX(line, titleFont, titleSize, PAGE_WIDTH), y: 645 - index * titleLineHeight }));

  const nameY = 535 - Math.max(0, titleLines.length - 1) * 16;
  const nameSize = fitPdfTextSize(input.participantName, bold, 430, 22, 15);
  page.drawText(input.participantName, { color: DARK_COLOR, font: bold, size: nameSize, x: centeredTextX(input.participantName, bold, nameSize, PAGE_WIDTH), y: nameY });
  page.drawLine({ color: TEXT_COLOR, start: { x: 95, y: nameY - 10 }, end: { x: 500, y: nameY - 10 }, thickness: 0.8 });

  const condition = input.condition?.trim() || "Participó";
  const description = `Por haber cumplido satisfactoriamente la condición de ${condition} en ${input.title}.`;
  const descriptionSize = 12;
  const descriptionLines = wrapPdfText(description, regular, descriptionSize, 385).slice(0, 4);
  const descriptionLineHeight = descriptionSize + 5;
  descriptionLines.forEach((line, index) => page.drawText(line, { color: TEXT_COLOR, font: regular, size: descriptionSize, x: centeredTextX(line, regular, descriptionSize, PAGE_WIDTH), y: nameY - 48 - index * descriptionLineHeight }));

  const detailY = nameY - 48 - descriptionLines.length * descriptionLineHeight - 8;
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
}
