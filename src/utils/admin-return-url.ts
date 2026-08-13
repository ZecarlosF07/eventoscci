export function getSafeAdminReturnUrl(value: string, fallback: string): URL {
  const safeValue = value.startsWith("/admin") && !value.startsWith("//") ? value : fallback;
  return new URL(safeValue, "http://localhost");
}

export function withAdminResult(value: string, fallback: string, result: string): string {
  const url = getSafeAdminReturnUrl(value, fallback);
  url.searchParams.set("resultado", result);
  return `${url.pathname}${url.search}`;
}
