import type { PDFFont } from "pdf-lib";

export function wrapPdfText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";
  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth || !current) {
      current = candidate;
      return;
    }
    lines.push(current);
    current = word;
  });
  if (current) lines.push(current);
  return lines;
}

export function fitWrappedPdfText(
  text: string,
  font: PDFFont,
  maxWidth: number,
  maxLines: number,
  preferredSize: number,
  minimumSize: number,
): [lines: string[], size: number] {
  for (let size = preferredSize; size >= minimumSize; size -= 1) {
    const lines = wrapPdfText(text, font, size, maxWidth);
    if (lines.length <= maxLines) return [lines, size];
  }
  return [wrapPdfText(text, font, minimumSize, maxWidth).slice(0, maxLines), minimumSize];
}

export function fitPdfTextSize(
  text: string,
  font: PDFFont,
  maxWidth: number,
  preferredSize: number,
  minimumSize: number,
): number {
  for (let size = preferredSize; size >= minimumSize; size -= 1) {
    if (font.widthOfTextAtSize(text, size) <= maxWidth) return size;
  }
  return minimumSize;
}

export function centeredTextX(text: string, font: PDFFont, size: number, pageWidth: number): number {
  return (pageWidth - font.widthOfTextAtSize(text, size)) / 2;
}

export function fitCertificateText(
  text: string, font: PDFFont, width: number, maxLines: number, preferred: number, minimum: number, label: string,
): [string[], number] {
  if (!text.trim()) return [[], preferred];
  const normalized = text.normalize("NFC");
  const available = new Set(font.getCharacterSet());
  if (Array.from(normalized.replace(/\s/g, "")).some((char) => !available.has(char.codePointAt(0) ?? -1))) {
    throw new Error(`${label} contiene caracteres incompatibles con el PDF.`);
  }
  for (let size = preferred; size >= minimum; size -= 0.5) {
    const lines = wrapPdfText(normalized, font, size, width);
    if (lines.length <= maxLines && lines.every((line) => font.widthOfTextAtSize(line, size) <= width)) return [lines, size];
  }
  throw new Error(`${label} no cabe de forma legible. Acorta el texto e inténtalo nuevamente.`);
}

export function certificateSignerSlots(count: number) {
  if (count < 1 || count > 4 || !Number.isInteger(count)) throw new Error("Configura entre una y cuatro firmas.");
  const columns = count === 4 ? 2 : count;
  const width = 426 / columns;
  return Array.from({ length: count }, (_, index) => ({
    centerX: 84.64 + width * ((index % columns) + 0.5),
    width: Math.min(220, width - 14),
    top: count === 4 ? 331 - Math.floor(index / columns) * 105 : 278,
  }));
}
