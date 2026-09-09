export function absoluteUrl(path: string, siteUrl: string): string {
  return new URL(path, `${siteUrl.replace(/\/$/, "")}/`).toString();
}
