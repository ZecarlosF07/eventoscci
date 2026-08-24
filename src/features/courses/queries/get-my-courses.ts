import "server-only";

import { mapCourseInstructors } from "@/features/courses/services/map-course-data";
import type { MyCourse, StudentCourseContent } from "@/features/courses/types/course.types";
import { requireActiveAccount } from "@/features/auth/services/account-guards";
import { getMyCourseCertificate } from "@/features/certificates/queries/get-my-certificates";
import { getCourseLessonProgress } from "@/features/progress/queries/get-lesson-progress";
import { getStudentCourseQuizSummaries } from "@/features/quizzes/queries/get-quizzes";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const MY_COURSE_SELECT = `
  id, status, progress_percent,
  course:courses!inner(
    id, title, slug, short_description, duration_text, academic_hours, banner_path,
    is_free, general_price, member_price, status, published_at, updated_at,
    instructor_links:course_instructors(
      id, is_primary, role_label, sort_order, deleted_at,
      speaker:speakers!course_instructors_speaker_id_fkey(
        id, first_names, last_names, professional_title, organization, bio, photo_path
      )
    )
  )
`;

export async function getMyCourses(): Promise<MyCourse[]> {
  const account = await requireActiveAccount();
  const client = await createServerSupabaseClient();
  const { data, error } = await client.from("course_enrollments").select(MY_COURSE_SELECT)
    .eq("person_id", account.person.id).in("status", ["active", "completed"])
    .is("deleted_at", null).order("access_granted_at", { ascending: false });
  if (error) throw new Error("No fue posible cargar tus cursos.", { cause: error });
  return (data ?? []).map((item) => ({
    ...item.course,
    enrollment: { id: item.id, progress_percent: item.progress_percent, status: item.status },
    instructors: mapCourseInstructors(item.course.instructor_links),
  }));
}

export async function getStudentCourseContent(courseId: string): Promise<StudentCourseContent | null> {
  const account = await requireActiveAccount();
  const client = await createServerSupabaseClient();
  const { data: enrollment, error: enrollmentError } = await client.from("course_enrollments")
    .select("*").eq("course_id", courseId).eq("person_id", account.person.id)
    .in("status", ["active", "completed"]).is("deleted_at", null).maybeSingle();
  if (enrollmentError) throw new Error("No fue posible validar tu matrícula.", { cause: enrollmentError });
  if (!enrollment) return null;

  const { data: course, error: courseError } = await client.from("courses").select(`
    *, instructor_links:course_instructors(
      id, is_primary, role_label, sort_order, deleted_at,
      speaker:speakers!course_instructors_speaker_id_fkey(
        id, first_names, last_names, professional_title, organization, bio, photo_path
      )
    )
  `).eq("id", courseId).maybeSingle();
  if (courseError) throw new Error("No fue posible cargar el curso.", { cause: courseError });
  if (!course) return null;

  const [moduleResult, materialResult, lessonProgress, quizSummaries, courseCertificate] = await Promise.all([
    client.from("course_modules").select("*").eq("course_id", courseId)
      .eq("is_published", true).is("deleted_at", null).order("sort_order"),
    client.from("course_materials").select("*").eq("course_id", courseId)
      .is("deleted_at", null).order("sort_order"),
    getCourseLessonProgress(enrollment.id),
    getStudentCourseQuizSummaries(courseId),
    getMyCourseCertificate(courseId),
  ]);
  if (moduleResult.error || materialResult.error) {
    throw new Error("No fue posible cargar el contenido y avance del curso.");
  }
  const modules = moduleResult.data ?? [];
  const moduleIds = modules.map((module) => module.id);
  const { data: lessons, error: lessonsError } = moduleIds.length
    ? await client.from("lessons").select("*").in("module_id", moduleIds)
      .eq("is_published", true).is("deleted_at", null).order("sort_order")
    : { data: [], error: null };
  if (lessonsError) throw new Error("No fue posible cargar las clases.", { cause: lessonsError });
  const { instructor_links: instructorLinks, ...courseRow } = course;
  return {
    courseCertificate,
    course: courseRow,
    enrollment,
    instructors: mapCourseInstructors(instructorLinks),
    lessonProgress,
    lessons: lessons ?? [],
    materials: materialResult.data ?? [],
    modules,
    quizSummaries,
  };
}

export async function hasCourseEnrollment(courseId: string, personId: string): Promise<boolean> {
  const client = await createServerSupabaseClient();
  const { count, error } = await client.from("course_enrollments").select("id", { count: "exact", head: true })
    .eq("course_id", courseId).eq("person_id", personId)
    .in("status", ["active", "completed"]).is("deleted_at", null);
  if (error) return false;
  return (count ?? 0) > 0;
}
