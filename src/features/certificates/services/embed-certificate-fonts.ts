import { readFile } from "node:fs/promises";
import path from "node:path";

import fontkit from "@pdf-lib/fontkit";
import { type PDFDocument, StandardFonts } from "pdf-lib";

import type { CertificateDocumentFonts, CertificateDocumentInput } from "@/features/certificates/types/certificate.types";

export async function embedCertificateFonts(pdf: PDFDocument, input: CertificateDocumentInput): Promise<CertificateDocumentFonts> {
  if (input.recipientType !== "speaker") {
    const regular = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    return { regular, bold, emphasis: bold };
  }

  const fontDirectory = path.join(process.cwd(), "public", "assets", "certificates", "fonts");
  const showMasthead = input.signers.length === 1 && !input.backgroundBytes;
  const [regular, bold, emphasis, masthead] = await Promise.all([
    readFile(path.join(fontDirectory, "Inter-Regular.ttf")),
    readFile(path.join(fontDirectory, "Inter-SemiBold.ttf")),
    readFile(path.join(fontDirectory, "CharisSIL-Bold.ttf")),
    showMasthead ? readFile(path.join(fontDirectory, "CharisSIL-Italic.ttf")) : undefined,
  ]);
  pdf.registerFontkit(fontkit);
  // Embed complete fonts so PDF viewers can resolve all of the TrueType glyphs.
  const options = { features: { liga: false } };
  return {
    regular: await pdf.embedFont(regular, options),
    bold: await pdf.embedFont(bold, options),
    emphasis: await pdf.embedFont(emphasis, options),
    masthead: masthead ? await pdf.embedFont(masthead, options) : undefined,
  };
}
