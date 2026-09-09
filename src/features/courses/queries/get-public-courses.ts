import "server-only";

import { unstable_cache } from "next/cache";

import { PUBLIC_COURSE_PAGE_SIZE } from "@/features/courses/constants/course.constants";
import { mapCourseListItem } from "@/features/courses/services/map-course-data";
import type { CoursePublicFilters } from "@/features/courses/types/course-page.types";
import type { CourseListItem, CoursePublicPage } from "@/features/courses/types/course.types";
import {
  PUBLIC_CACHE_REVALIDATE_SECONDS,
  PUBLIC_CACHE_TAGS,
} from "@/features/seo/constants/public-cache.constants";
import { sanitizePostgrestSearchTerm } from "@/features/seo/utils/postgrest-search";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

export const PUBLIC_COURSE_LIST_SELECT = `
  id, title, slug, short_description, duration_text, academic_hours, banner_path,
  is_free, general_price, member_price, status, published_at, updated_at,
  instructor_links:course_instructors(
    id, is_primary, role_label, sort_order, deleted_at,
    speaker:speakers!course_instructors_speaker_id_fkey(
      id, first_names, last_names, professional_title, organization, bio, photo_path
    )
  )
`;

const getCachedPublishedCoursePage = unstable_cache(
  async (filters: CoursePublicFilters): Promise<CoursePublicPage> => {
    const client = createPublicSupabaseClient();
    const from = (filters.page - 1) * PUBLIC_COURSE_PAGE_SIZE;
    let request = client.from("courses")
      .select(PUBLIC_COURSE_LIST_SELECT, { count: "exact" })
      .eq("status", "published")
      .not("published_at", "is", null)
      .is("deleted_at", null)
      .order("published_at", { ascending: false })
      .order("id", { ascending: true })
      .range(from, from + PUBLIC_COURSE_PAGE_SIZE - 1);

    if (filters.query) {
      const term = sanitizePostgrestSearchTerm(filters.query);
      if (term) request = request.or(`title.ilike.%${term}%,short_description.ilike.%${term}%`);
    }

    const { count, data, error } = await request;
    if (error && error.code !== "PGRST103") {
      throw new Error("No fue posible consultar el catálogo de cursos.", { cause: error });
    }
    const total = count ?? 0;
    return {
      courses: (data ?? []).map(mapCourseListItem),
      page: filters.page,
      pageCount: Math.max(1, Math.ceil(total / PUBLIC_COURSE_PAGE_SIZE)),
      total,
    };
  },
  ["public-course-page"],
  { revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS, tags: [PUBLIC_CACHE_TAGS.courses] },
);

export function getPublishedCoursePage(filters: CoursePublicFilters): Promise<CoursePublicPage> {
  return getCachedPublishedCoursePage(filters);
}

export async function getFeaturedPublishedCourses(): Promise<CourseListItem[]> {
  return (await getCachedPublishedCoursePage({ page: 1 })).courses;
}
