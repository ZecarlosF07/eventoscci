const GOOGLE_MAPS_EMBED_HOSTS = new Set(["google.com", "maps.google.com", "www.google.com"]);

export function isGoogleMapsEmbedUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !GOOGLE_MAPS_EMBED_HOSTS.has(url.hostname)) return false;
    return Boolean(url.search) && (
      url.pathname === "/maps/embed" ||
      (url.hostname === "maps.google.com" && url.pathname === "/maps")
    );
  } catch {
    return false;
  }
}

export function getGoogleMapsDirectionsUrl(locationName: string | null, address: string | null): string {
  const query = [locationName, address].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
