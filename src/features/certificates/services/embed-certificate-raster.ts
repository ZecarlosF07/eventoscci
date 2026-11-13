import type { PDFDocument } from "pdf-lib";
import sharp from "sharp";

export async function embedCertificateRaster(pdf: PDFDocument, bytes: Uint8Array) {
  if (bytes[0] === 0x89 && bytes[1] === 0x50) return pdf.embedPng(bytes);
  const header = Buffer.from(bytes.subarray(0, 12));
  if (header.toString("ascii", 0, 4) === "RIFF" && header.toString("ascii", 8, 12) === "WEBP") {
    return pdf.embedPng(await sharp(bytes, { limitInputPixels: 24_000_000 }).png().toBuffer());
  }
  return pdf.embedJpg(bytes);
}
