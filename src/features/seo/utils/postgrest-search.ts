export function sanitizePostgrestSearchTerm(value: string): string {
  return value
    .trim()
    .replace(/[(),.%_'"\\]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 100);
}
