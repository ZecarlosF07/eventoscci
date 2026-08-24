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
