import "server-only";

import { attendanceRegistrationSchema } from "@/features/attendance/schemas/attendance.schema";
import type { AttendanceActivityData, AttendanceFilters, AttendanceItem } from "@/features/attendance/types/attendance.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { escapePostgrestSearch } from "@/utils/postgrest-search";

const ATTENDANCE_SELECT = `
  id, registration_code, registration_type, status, company_snapshot,
  certificate_mode_snapshot, certificate_price_snapshot,
  certificate_requested_at, certificate_followed_up_at,
  activity:activities!inner(certificate_mode),
  person:people!inner(document_number, first_names, last_names, email, phone),
  attendance:attendance!inner(id, status, marked_at, notes)
`;
const ATTENDANCE_PAGE_SIZE = 30;

export async function getActivityAttendance(
  activityId: string,
  filters: AttendanceFilters,
): Promise<AttendanceActivityData | null> {
  const client = await createServerSupabaseClient();
  const activityResult = await client
    .from("activities")
    .select("id, title, type")
    .eq("id", activityId)
    .neq("status", "archived")
    .is("deleted_at", null)
    .maybeSingle();

  if (activityResult.error) throw new Error("No fue posible consultar la actividad.", { cause: activityResult.error });
  if (!activityResult.data) return null;

  let query = client
    .from("registrations")
    .select(ATTENDANCE_SELECT, { count: "exact" })
    .eq("activity_id", activityId)
    .is("deleted_at", null)
    .is("person.deleted_at", null)
    .is("attendance.deleted_at", null)
    .order("created_at", { ascending: false });

  if (filters.registrationStatus) query = query.eq("status", filters.registrationStatus);
  if (filters.registrationType) query = query.eq("registration_type", filters.registrationType);
  if (filters.attendanceStatus) query = query.eq("attendance.status", filters.attendanceStatus);
  const search = filters.query ? escapePostgrestSearch(filters.query) : "";
  if (search) {
    const pattern = `%${search}%`;
    query = query.or([
      `document_number.ilike.${pattern}`,
      `first_names.ilike.${pattern}`,
      `last_names.ilike.${pattern}`,
      `email.ilike.${pattern}`,
    ].join(","), { referencedTable: "person" });
  }

  const from = (filters.page - 1) * ATTENDANCE_PAGE_SIZE;
  const { count, data, error } = await query.range(from, from + ATTENDANCE_PAGE_SIZE - 1);
  if (error) throw new Error("No fue posible consultar la asistencia.", { cause: error });
  const attendance: AttendanceItem[] = (data ?? []).map((item) => {
    const parsed = attendanceRegistrationSchema.safeParse(item);
    if (!parsed.success || !parsed.data.attendance[0]) {
      throw new Error("La respuesta de asistencia no tiene el formato esperado.");
    }
    const attendanceRow = parsed.data.attendance[0];
    return {
      id: attendanceRow.id,
      marked_at: attendanceRow.marked_at,
      notes: attendanceRow.notes,
      registration: {
        activity: parsed.data.activity,
        certificate_followed_up_at: parsed.data.certificate_followed_up_at,
        certificate_mode_snapshot: parsed.data.certificate_mode_snapshot,
        certificate_price_snapshot: parsed.data.certificate_price_snapshot,
        certificate_requested_at: parsed.data.certificate_requested_at,
        company_snapshot: parsed.data.company_snapshot,
        id: parsed.data.id,
        person: parsed.data.person,
        registration_code: parsed.data.registration_code,
        registration_type: parsed.data.registration_type,
        status: parsed.data.status,
      },
      status: attendanceRow.status,
    };
  });
  const total = count ?? 0;
  return {
    activity: activityResult.data,
    attendance,
    page: filters.page,
    pageCount: Math.max(1, Math.ceil(total / ATTENDANCE_PAGE_SIZE)),
    total,
  };
}
