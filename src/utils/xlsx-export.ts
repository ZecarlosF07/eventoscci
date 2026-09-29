import ExcelJS from "exceljs";

export type ExportCell = string | number | null | undefined;

export interface ExportTable {
  headers: string[];
  rows: ExportCell[][];
}

const XLSX_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export async function createXlsxResponse(table: ExportTable, filename: string, sheetName: string): Promise<Response> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Cámara de Comercio de Ica";
  const sheet = workbook.addWorksheet(sheetName, {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  const columnWidths = table.headers.map((header) => Math.min(55, Math.max(16, header.length + 2)));

  sheet.addRow(table.headers);
  sheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0D2922" } };
    cell.alignment = { vertical: "middle", wrapText: true };
  });
  sheet.getRow(1).height = 30;

  for (const row of table.rows) {
    // ExcelJS writes strings as string cells, never as executable formulas.
    sheet.addRow(row.map((value) => value ?? null));
    row.forEach((value, index) => {
      columnWidths[index] = Math.min(55, Math.max(columnWidths[index] ?? 16, String(value ?? "").length + 2));
    });
  }

  sheet.columns.forEach((column, index) => {
    column.width = columnWidths[index] ?? 16;
    column.alignment = { vertical: "top", wrapText: true };
  });
  if (table.headers.length > 0) {
    sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: Math.max(1, table.rows.length + 1), column: table.headers.length } };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
      "Content-Type": XLSX_CONTENT_TYPE,
    },
  });
}
