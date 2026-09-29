import assert from "node:assert/strict";
import test from "node:test";
import ExcelJS from "exceljs";

import { createXlsxResponse } from "@/utils/xlsx-export";

test("exporta un Excel válido con identificadores como texto y fórmulas inertes", async () => {
  const response = await createXlsxResponse({
    headers: ["RUC", "Destinatario", "Importe"],
    rows: [["00123456789", "=WEBSERVICE(\"https://example.test\")", 300]],
  }, "comprobantes", "Comprobantes");

  assert.equal(response.headers.get("Content-Type"), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  assert.equal(response.headers.get("Content-Disposition"), 'attachment; filename="comprobantes.xlsx"');
  assert.equal(response.headers.get("Cache-Control"), "private, no-store");

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(Buffer.from(await response.arrayBuffer()) as unknown as Parameters<typeof workbook.xlsx.load>[0]);
  const sheet = workbook.getWorksheet("Comprobantes");
  assert.ok(sheet);
  assert.equal(sheet.rowCount, 2);
  assert.equal(sheet.getCell("A2").value, "00123456789");
  assert.equal(sheet.getCell("B2").value, '=WEBSERVICE("https://example.test")');
  assert.equal(sheet.getCell("B2").type, ExcelJS.ValueType.String);
  assert.equal(sheet.getCell("C2").value, 300);
  assert.equal(sheet.views[0].state, "frozen");
  assert.equal(sheet.views[0].ySplit, 1);
});
