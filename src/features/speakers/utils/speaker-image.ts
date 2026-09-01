import { getPublicEnv } from "@/lib/env/public-env";

export function getSpeakerImageUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${getPublicEnv().supabaseUrl}/storage/v1/object/public/speaker-images/${path}`;
}
