export const PUBLIC_CACHE_REVALIDATE_SECONDS = 900;
export const PUBLIC_AVAILABILITY_REVALIDATE_SECONDS = 30;

export const PUBLIC_CACHE_TAGS = {
  activities: "public-activities",
  availability: "public-activity-availability",
  categories: "public-categories",
  courses: "public-courses",
  sitemap: "public-sitemap",
} as const;
