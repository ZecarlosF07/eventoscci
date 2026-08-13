import "server-only";

import type { CourseStudent, PersonCourseOption } from "@/features/courses/types/course.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { escapePostgrestSearch } from "@/utils/postgrest-search";

export async function getCourseStudents(courseId: string): Promise<CourseStudent[]> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client.from("course_enrollments")
    .select("id, status, registration_type, price_snapshot, progress_percent, access_granted_at, revocation_reason, person:people!inner(id, document_number, first_names, last_names, email)")
    .eq("course_id", courseId).is("deleted_at", null).order("access_granted_at", { ascending: false });
  if (error) throw new Error("No fue posible cargar los alumnos del curso.", { cause: error });
  return (data ?? []).map((item) => ({
    accessGrantedAt: item.access_granted_at,
    enrollmentId: item.id,
    person: item.person,
    priceSnapshot: item.price_snapshot,
    progressPercent: item.progress_percent,
    registrationType: item.registration_type,
    revocationReason: item.revocation_reason,
    status: item.status,
  }));
}

export async function searchPeopleForCourse(query: string): Promise<PersonCourseOption[]> {
  if (query.trim().length < 2) return [];
  const client = await createServerSupabaseClient();
  const pattern = `%${escapePostgrestSearch(query.trim())}%`;
  const { data, error } = await client.from("people")
    .select("id, document_number, first_names, last_names, email, accounts:user_accounts(user_id, deleted_at, is_active)")
    .is("deleted_at", null)
    .or(`document_number.ilike.${pattern},first_names.ilike.${pattern},last_names.ilike.${pattern},email.ilike.${pattern}`)
    .order("last_names").limit(20);
  if (error) throw new Error("No fue posible buscar personas.", { cause: error });
  return (data ?? []).map(({ accounts, ...person }) => ({
    ...person,
    has_account: accounts.some((account) => account.is_active && !account.deleted_at),
  }));
}
