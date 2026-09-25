import { createHash } from "node:crypto";

import ExcelJS from "exceljs";

import type {
  MemberRosterRowError,
  ParsedMemberRoster,
} from "@/features/member-roster/types/member-roster.types";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_ROWS = 100_000;
const MAX_ERRORS = 100;

function normalizeHeader(value: unknown): string {
  return typeof value === "string"
    ? value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    : "";
}

function cellText(value: ExcelJS.CellValue): string | null {
  return typeof value === "string" ? value.trim() : null;
}

function rucText(value: ExcelJS.CellValue): string | null {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isSafeInteger(value) && value >= 0) {
    return String(value);
  }
  return null;
}

export async function parseMemberRosterWorkbook(file: File): Promise<ParsedMemberRoster> {
  if (!file.name.toLowerCase().endsWith(".xlsx") || file.size > MAX_FILE_BYTES || file.size < 100) {
    throw new Error("Selecciona un archivo .xlsx de hasta 5 MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer[0] !== 0x50 || buffer[1] !== 0x4b) {
    throw new Error("El archivo no parece ser un Excel .xlsx válido.");
  }

  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(buffer as unknown as Parameters<typeof workbook.xlsx.load>[0]);
  } catch {
    throw new Error("No se pudo leer el archivo Excel. Comprueba que sea .xlsx y no esté dañado.");
  }

  const worksheet = workbook.worksheets[0];
  if (!worksheet) throw new Error("El Excel no contiene una hoja de datos.");
  if (worksheet.rowCount > MAX_ROWS + 1) throw new Error("El Excel supera el límite técnico de 100 000 filas.");

  const header = worksheet.getRow(1);
  if (normalizeHeader(header.getCell(1).value) !== "ruc"
    || normalizeHeader(header.getCell(2).value) !== "razon social"
    || header.actualCellCount !== 2) {
    throw new Error("La primera fila debe contener únicamente las columnas RUC y Razón social.");
  }

  const errors: MemberRosterRowError[] = [];
  const rows: ParsedMemberRoster["rows"] = [];
  const seen = new Set<string>();
  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    const rawRuc = row.getCell(1).value;
    const rawName = row.getCell(2).value;
    if (rawRuc === null && rawName === null && row.actualCellCount === 0) continue;

    const ruc = rucText(rawRuc);
    const legalName = cellText(rawName);
    let message: string | null = null;
    if (row.actualCellCount > 2) message = "La fila tiene columnas adicionales.";
    else if (ruc === null) message = "El RUC debe ser texto o un número entero; no se aceptan fórmulas.";
    else if (legalName === null) message = "La razón social debe ser texto; no se aceptan fórmulas ni números.";
    else if (!/^\d{11}$/.test(ruc)) message = "El RUC debe tener exactamente 11 dígitos. Si comienza con cero, guárdalo como texto.";
    else if (legalName.length < 2 || legalName.length > 250) message = "La razón social debe tener entre 2 y 250 caracteres.";
    else if (seen.has(ruc)) message = "El RUC está duplicado en el archivo.";

    if (message) {
      if (errors.length < MAX_ERRORS) errors.push({ message, row: rowNumber });
      continue;
    }
    seen.add(ruc!);
    rows.push({ legal_name: legalName!, ruc: ruc! });
  }

  if (!rows.length && !errors.length) throw new Error("El padrón no puede estar vacío.");
  return {
    errors,
    fileHash: createHash("sha256").update(buffer).digest("hex"),
    fileName: file.name,
    rows,
  };
}
