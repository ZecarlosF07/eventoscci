/** Quote cells and prevent spreadsheet formula execution, including leading whitespace. */
export function csvCell(value: string | number | null): string {
  let text = value === null ? "" : String(value);
  if (/^[\t\r]|^\s*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
