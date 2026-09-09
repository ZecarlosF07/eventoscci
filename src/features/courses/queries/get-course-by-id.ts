import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";

import { mapCourseInstructors } from "@/features/courses/services/map-course-data";
import type { CourseContent, CourseDetail } from "@/features/courses/types/course.types";
import {
  PUBLIC_CACHE_REVALIDATE_SECONDS,
  PUBLIC_CACHE_TAGS,
} from "@/features/seo/constants/public-cache.constants";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const COURSE_DETAIL_SELECT = `
  *,
  instructor_links:course_instructors(
    id, is_primary, role_label, sort_order, deleted_at,
    speaker:speakers!course_instructors_speaker_id_fkey(
      id, first_names, last_names, professional_title, organization, bio, photo_path
    )
  ),
  modules:course_modules(*)
`;

function mapCourseDetail(data: NonNullable<Awaited<ReturnType<typeof fetchCourseDetail>>>): CourseDetail {
  const { instructor_links: instructorLinks, modules, ...course } = data;
  return {
    ...course,
    instructors: mapCourseInstructors(instructorLinks),
    modules: modules.filter((module) => !module.deleted_at).sort((first, second) => first.sort_order - second.sort_order),
  };
}

async function fetchCourseDetail(idField: "id" | "slug", value: string) {
  const client = await createServerSupabaseClient();
  const { data, error } = await client.from("courses").select(COURSE_DETAIL_SELECT)
    .eq(idField, value).is("deleted_at", null).maybeSingle();
  if (error) throw new Error("No fue posible cargar el curso.", { cause: error });
  return data;
}

export async function getAdminCourseById(id: string): Promise<CourseDetail | null> {
  const data = await fetchCourseDetail("id", id);
  return data ? mapCourseDetail(data) : null;
}

const getCachedPublicCourseBySlug = unstable_cache(async function getCachedPublicCourseBySlug(slug: string): Promise<CourseDetail | null> {
  const client = createPublicSupabaseClient();
  const { data, error } = await client.from("courses").select(COURSE_DETAIL_SELECT)
    .eq("slug", slug).eq("status", "published").not("published_at", "is", null)
    .is("deleted_at", null).maybeSingle();
  if (error) throw new Error("No fue posible cargar el curso público.", { cause: error });
  if (!data || data.status !== "published" || !data.published_at) return null;
  const course = mapCourseDetail(data);
  return { ...course, modules: course.modules.filter((module) => module.is_published) };
}, ["public-course-detail"], {
  revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
  tags: [PUBLIC_CACHE_TAGS.courses],
});

export const getPublicCourseBySlug = cache(
  (slug: string) => getCachedPublicCourseBySlug(slug),
);

export async function getAdminCourseContent(id: string): Promise<CourseContent | null> {
  const course = await getAdminCourseById(id);
  if (!course) return null;
  const client = await createServerSupabaseClient();
  const moduleIds = course.modules.map((module) => module.id);
  const lessonRequest = moduleIds.length
    ? client.from("lessons").select("*").in("module_id", moduleIds).is("deleted_at", null).order("sort_order")
    : Promise.resolve({ data: [], error: null });
  const [lessonResult, materialResult] = await Promise.all([
    lessonRequest,
    client.from("course_materials").select("*").eq("course_id", id).is("deleted_at", null).order("sort_order"),
  ]);
  if (lessonResult.error || materialResult.error) {
    throw new Error("No fue posible cargar el contenido académico.", { cause: lessonResult.error ?? materialResult.error });
  }
  return { ...course, lessons: lessonResult.data ?? [], materials: materialResult.data ?? [] };
}
