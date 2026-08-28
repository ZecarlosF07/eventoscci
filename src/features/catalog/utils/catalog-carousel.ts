import type { ActivityListItem } from "@/features/activities/types/activity.types";
import {
  formatActivityDate,
  getActivityBannerUrl,
  getModalityLabel,
  getUpcomingActivityDate,
} from "@/features/activities/utils/activity-formatters";
import { getPublicActivityRoute } from "@/features/activities/utils/activity-routes";
import type { CatalogCarouselSlide } from "@/features/catalog/components/CatalogHeroCarousel/types/catalog-hero-carousel.types";
import type { CourseListItem } from "@/features/courses/types/course.types";
import { getCourseBannerUrl } from "@/features/courses/utils/course-formatters";
import { getPublicCourseRoute } from "@/features/courses/utils/course-routes";

const MAX_CAROUSEL_ITEMS = 5;

export function createActivityCarouselSlides(activities: ActivityListItem[]): CatalogCarouselSlide[] {
  return activities
    .map((activity) => ({ activity, nextDate: getUpcomingActivityDate(activity.dates) }))
    .filter(({ activity, nextDate }) => activity.status === "published" && Boolean(nextDate))
    .sort((first, second) => (first.nextDate?.starts_at ?? "").localeCompare(second.nextDate?.starts_at ?? ""))
    .slice(0, MAX_CAROUSEL_ITEMS)
    .map(({ activity, nextDate }) => ({
      badge: activity.category?.name ?? getModalityLabel(activity.modality),
      bannerUrl: getActivityBannerUrl(activity.banner_path),
      description: activity.short_description,
      href: getPublicActivityRoute(activity.type, activity.slug),
      id: activity.id,
      meta: nextDate ? `${formatActivityDate(nextDate.starts_at)} · ${getModalityLabel(activity.modality)}` : null,
      title: activity.title,
    }));
}

export function createCourseCarouselSlides(courses: CourseListItem[]): CatalogCarouselSlide[] {
  return courses
    .filter((course) => course.status === "published")
    .slice(0, MAX_CAROUSEL_ITEMS)
    .map((course) => ({
      badge: course.is_free ? "Curso gratuito" : "Curso virtual",
      bannerUrl: getCourseBannerUrl(course.banner_path),
      description: course.short_description,
      href: getPublicCourseRoute(course.slug),
      id: course.id,
      meta: course.duration_text ?? (course.academic_hours ? `${course.academic_hours} horas académicas` : "Aprende a tu ritmo"),
      title: course.title,
    }));
}
