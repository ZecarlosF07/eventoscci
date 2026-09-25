import assert from "node:assert/strict";
import test from "node:test";

import ExcelJS from "exceljs";

import { parseMemberRosterWorkbook } from "@/features/member-roster/utils/parse-member-roster";

async function workbookFile(rows: (string | number | { formula: string; result: string })[][]): Promise<File> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Asociados");
  rows.forEach((row) => sheet.addRow(row));
  const content = await workbook.xlsx.writeBuffer();
  return new File([content as BlobPart], "asociados.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

test("importa RUC de texto o numéricos y conserva ceros cuando son texto", async () => {
  const file = await workbookFile([
    ["RUC", "Razón social"],
    ["00123456789", "Empresa Uno"],
    [20123456789, "Empresa Dos"],
  ]);
  const parsed = await parseMemberRosterWorkbook(file);
  assert.deepEqual(parsed.errors, []);
  assert.deepEqual(parsed.rows, [
    { ruc: "00123456789", legal_name: "Empresa Uno" },
    { ruc: "20123456789", legal_name: "Empresa Dos" },
  ]);
  assert.match(parsed.fileHash, /^[a-f0-9]{64}$/);
});

test("detecta duplicados entre texto y número y rechaza fórmulas o valores inválidos", async () => {
  const file = await workbookFile([
    ["RUC", "Razón social"],
    ["20123456789", "Empresa Uno"],
    [20123456789, "Empresa Repetida"],
    [{ formula: "2+2", result: "20123456789" }, "RUC fórmula"],
    [20987654321, "Empresa Dos"],
    [20987654321.5, "RUC decimal"],
    [1234567890, "RUC incompleto"],
    [20987654322, 123],
  ]);
  const parsed = await parseMemberRosterWorkbook(file);
  assert.deepEqual(parsed.rows.map((row) => row.ruc), ["20123456789", "20987654321"]);
  assert.equal(parsed.errors.length, 6);
  assert.deepEqual(parsed.errors.map((error) => error.row), [2, 3, 4, 6, 7, 8]);
  assert.match(parsed.errors[0].message, /RUC 20123456789.*fila 3/);
  assert.match(parsed.errors[1].message, /RUC 20123456789.*fila 2/);
  assert.match(parsed.errors[2].message, /fórmulas/);
  assert.match(parsed.errors[3].message, /número entero/);
  assert.match(parsed.errors[4].message, /11 dígitos/);
  assert.match(parsed.errors[5].message, /razón social debe ser texto/);
});

test("señala la fila original y todas las repeticiones de un RUC", async () => {
  const file = await workbookFile([
    ["RUC", "Razón social"],
    ["20123456789", "Empresa Uno"],
    [20123456789, "Empresa Dos"],
    ["20123456789", "Empresa Tres"],
  ]);
  const parsed = await parseMemberRosterWorkbook(file);
  assert.deepEqual(parsed.errors.map((error) => error.row), [2, 3, 4]);
  assert.match(parsed.errors[0].message, /fila 3/);
  assert.match(parsed.errors[1].message, /fila 2/);
  assert.match(parsed.errors[2].message, /fila 2/);
});
