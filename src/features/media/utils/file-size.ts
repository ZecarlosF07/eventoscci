export function formatMegabytes(size: number): string {
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
