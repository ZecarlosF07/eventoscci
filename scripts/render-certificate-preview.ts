import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { generateCertificatePdf } from "../src/features/certificates/services/generate-certificate-pdf";

async function renderPreview(): Promise<void> {
  const outputDirectory = path.join(process.cwd(), "output", "pdf");
  const outputPath = path.join(outputDirectory, "certificate-preview.pdf");
  await mkdir(outputDirectory, { recursive: true });
  const pdf = await generateCertificatePdf({
    academicHours: 21,
    accessUrl: "https://eventos.camaraica.org.pe/certificados/00000000-0000-4000-8000-000000000001",
    certificateCode: "CCI-CERT-2026-000001",
    certificateType: "activity",
    condition: "Culminó",
    dateText: "10 de junio de 2026",
    participantName: "María Fernanda Quispe Mendoza",
    signers: [{
      signature_path: null,
      signer_name: "Eduardo Ojeda Davila",
      signer_title: "Presidente Institucional",
      sort_order: 0,
    }],
    title: "Curso de Análisis y Evaluación Financiera",
  });
  await writeFile(outputPath, pdf);
  console.log(outputPath);
}

void renderPreview();
