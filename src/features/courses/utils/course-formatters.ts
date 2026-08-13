import { getPublicEnv } from "@/lib/env/public-env";

export function getCourseBannerUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${getPublicEnv().supabaseUrl}/storage/v1/object/public/course-banners/${path}`;
}

export function formatCoursePrice(value: number): string {
  return new Intl.NumberFormat("es-PE", { currency: "PEN", style: "currency" }).format(value);
}

export function formatLessonDuration(seconds: number | null): string | null {
  if (!seconds) return null;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function getInstructorName(firstNames: string, lastNames: string): string {
  return `${firstNames} ${lastNames}`.trim();
}
