export function escapePostgrestSearch(value: string): string {
  return value.trim().replace(/\s+/g, " ").replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}
