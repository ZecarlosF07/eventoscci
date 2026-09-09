import type { MetadataRoute } from "next";

import { ROUTES } from "@/constants/routes";
import { getActivityBannerUrl } from "@/features/activities/utils/activity-formatters";
import { getPublicActivityRoute } from "@/features/activities/utils/activity-routes";
import { getCourseBannerUrl } from "@/features/courses/utils/course-formatters";
import { getPublicCourseRoute } from "@/features/courses/utils/course-routes";
import { getSitemapEntries } from "@/features/seo/queries/get-sitemap-entries";
import { absoluteUrl } from "@/features/seo/utils/seo-url";
import { getSiteUrl } from "@/lib/env/server-env";

const STATIC_ROUTES = [
  { changeFrequency: "daily", path: ROUTES.home, priority: 1 },
  { changeFrequency: "daily", path: ROUTES.events, priority: 0.9 },
  { changeFrequency: "daily", path: ROUTES.trainings, priority: 0.9 },
  { changeFrequency: "weekly", path: ROUTES.courses, priority: 0.9 },
  { changeFrequency: "monthly", path: ROUTES.certificates, priority: 0.6 },
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const entries = await getSitemapEntries();
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((entry) => ({
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
    url: absoluteUrl(entry.path, siteUrl),
  }));
  const activities: MetadataRoute.Sitemap = entries.activities.map((activity) => {
    const image = getActivityBannerUrl(activity.banner_path);
    return {
      changeFrequency: "weekly",
      images: image ? [absoluteUrl(image, siteUrl)] : undefined,
      lastModified: new Date(activity.updated_at),
      priority: 0.8,
      url: absoluteUrl(getPublicActivityRoute(activity.type, activity.slug), siteUrl),
    };
  });
  const courses: MetadataRoute.Sitemap = entries.courses.map((course) => {
    const image = getCourseBannerUrl(course.banner_path);
    return {
      changeFrequency: "monthly",
      images: image ? [absoluteUrl(image, siteUrl)] : undefined,
      lastModified: new Date(course.updated_at),
      priority: 0.8,
      url: absoluteUrl(getPublicCourseRoute(course.slug), siteUrl),
    };
  });

  return [...staticEntries, ...activities, ...courses];
}
