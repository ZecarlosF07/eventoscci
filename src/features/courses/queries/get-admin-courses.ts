import "server-only";

import { COURSE_PAGE_SIZE } from "@/features/courses/constants/course.constants";
import { mapCourseListItem } from "@/features/courses/services/map-course-data";
import type { CourseAdminFilters, CourseAdminPage, CourseListItem } from "@/features/courses/types/course.types";
import { filterCoursesByQuery } from "@/features/courses/utils/filter-courses";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const COURSE_LIST_SELECT = `
  id, title, slug, short_description, duration_text, academic_hours, banner_path,
  is_free, general_price, member_price, status, published_at, updated_at,
  instructor_links:course_instructors(
    id, is_primary, role_label, sort_order, deleted_at,
    speaker:speakers!course_instructors_speaker_id_fkey(
      id, first_names, last_names, professional_title, organization, bio, photo_path
    )
  )
`;

export async function getAdminCourses(filters: CourseAdminFilters): Promise<CourseAdminPage> {
  const client = await createServerSupabaseClient();
  const from = (filters.page - 1) * COURSE_PAGE_SIZE;
  let query = client.from("courses")
    .select(COURSE_LIST_SELECT, { count: "exact" })
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .range(from, from + COURSE_PAGE_SIZE - 1);

  if (filters.query) query = query.ilike("title", `%${filters.query}%`);
  if (filters.status) query = query.eq("status", filters.status);

  const { count, data, error } = await query;
  if (error) throw new Error("No fue posible cargar los cursos.", { cause: error });
  const total = count ?? 0;
  return {
    courses: (data ?? []).map(mapCourseListItem),
    page: filters.page,
    pageCount: Math.max(1, Math.ceil(total / COURSE_PAGE_SIZE)),
    total,
  };
}

export async function getPublishedCourses(query?: string): Promise<CourseListItem[]> {
  const client = await createServerSupabaseClient();
  const request = client.from("courses").select(COURSE_LIST_SELECT)
    .eq("status", "published").not("published_at", "is", null).is("deleted_at", null)
    .order("published_at", { ascending: false });
  const { data, error } = await request;
  if (error) throw new Error("No fue posible consultar el catálogo de cursos.", { cause: error });
  return filterCoursesByQuery((data ?? []).map(mapCourseListItem), query);
}
