export function escapePostgrestSearch(value: string): string {
  return value.replace(/[%,()_]/g, " ").replace(/\s+/g, " ").trim();
}
