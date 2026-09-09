const SEO_DESCRIPTION_LIMIT = 160;
const SEO_TITLE_LIMIT = 68;

export function normalizeSeoText(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncateSeoText(value: string, limit: number): string {
  const normalized = normalizeSeoText(value);
  if (normalized.length <= limit) return normalized;

  const candidate = normalized.slice(0, Math.max(1, limit - 1));
  const lastSpace = candidate.lastIndexOf(" ");
  const boundary = lastSpace >= Math.floor(limit * 0.65) ? lastSpace : candidate.length;
  return `${candidate.slice(0, boundary).trimEnd()}…`;
}

export function buildSeoTitle(value: string): string {
  return truncateSeoText(value, SEO_TITLE_LIMIT);
}

export function buildSeoDescription(
  preferred: string | null | undefined,
  fallback: string,
  suffix?: string,
): string {
  const base = normalizeSeoText(preferred || fallback);
  const normalizedSuffix = suffix ? normalizeSeoText(suffix) : "";
  if (!normalizedSuffix || base.toLocaleLowerCase("es-PE").includes("ica")) {
    return truncateSeoText(base, SEO_DESCRIPTION_LIMIT);
  }

  const available = SEO_DESCRIPTION_LIMIT - normalizedSuffix.length - 1;
  return `${truncateSeoText(base, available)} ${normalizedSuffix}`;
}
