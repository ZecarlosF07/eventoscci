import type { CourseEnrollmentStatus, CourseStatus } from "@/features/courses/types/course.types";

export const COURSE_BANNER_BUCKET = "course-banners";
export const COURSE_MATERIAL_BUCKET = "course-materials";
export const COURSE_VIDEO_BUCKET = "course-videos";
export const COURSE_PAGE_SIZE = 10;
export const MAX_COURSE_BANNER_SIZE = 5 * 1024 * 1024;
export const MAX_COURSE_MATERIAL_SIZE = 50 * 1024 * 1024;

export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  archived: "Archivado",
  draft: "Borrador",
  published: "Publicado",
};

export const COURSE_ENROLLMENT_STATUS_LABELS: Record<CourseEnrollmentStatus, string> = {
  active: "Activo",
  completed: "Completado",
  revoked: "Revocado",
};

export const VIDEO_PROVIDER_OPTIONS = [
  { label: "YouTube", value: "youtube" },
  { label: "Vimeo", value: "vimeo" },
  { label: "Video por URL", value: "external" },
  { label: "Supabase Storage", value: "supabase" },
] as const;
