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

test("importa únicamente RUC de texto y razón social, conservando ceros", async () => {
  const file = await workbookFile([["RUC", "Razón social"], ["00123456789", "Empresa Uno"]]);
  const parsed = await parseMemberRosterWorkbook(file);
  assert.deepEqual(parsed.errors, []);
  assert.deepEqual(parsed.rows, [{ ruc: "00123456789", legal_name: "Empresa Uno" }]);
  assert.match(parsed.fileHash, /^[a-f0-9]{64}$/);
});

test("detecta duplicados y rechaza números y fórmulas en el Excel", async () => {
  const file = await workbookFile([
    ["RUC", "Razón social"],
    ["20123456789", "Empresa Uno"],
    ["20123456789", "Empresa Repetida"],
    [20123456789, "RUC numérico"],
    [{ formula: "2+2", result: "20123456789" }, "RUC fórmula"],
  ]);
  const parsed = await parseMemberRosterWorkbook(file);
  assert.equal(parsed.rows.length, 1);
  assert.equal(parsed.errors.length, 3);
});
