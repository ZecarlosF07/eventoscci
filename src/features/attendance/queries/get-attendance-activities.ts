import "server-only";

import { attendanceActivityOptionSchema } from "@/features/attendance/schemas/attendance.schema";
import type { AttendanceActivityOption } from "@/features/attendance/types/attendance.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getAttendanceActivities(): Promise<AttendanceActivityOption[]> {
  const client = await createServerSupabaseClient();
  const { data, error } = await client
    .from("activities")
    .select("id, title, type, status, registrations(id)")
    .is("deleted_at", null)
    .is("registrations.deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(500);

  if (error) throw new Error("No fue posible consultar las actividades.", { cause: error });
  return (data ?? []).map((item) => {
    const parsed = attendanceActivityOptionSchema.safeParse(item);
    if (!parsed.success) throw new Error("La respuesta de actividades no tiene el formato esperado.");
    const { registrations, ...activity } = parsed.data;
    return { ...activity, registrationCount: registrations.length };
  });
}
