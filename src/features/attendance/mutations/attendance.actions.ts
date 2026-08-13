"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { ROUTES } from "@/constants/routes";
import { requireAdmin } from "@/features/auth/services/admin-session";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { withAdminResult } from "@/utils/admin-return-url";

const attendanceInputSchema = z.object({
  attendanceIds: z.array(z.uuid()).min(1).max(500),
  notes: z.string().trim().max(500),
  status: z.enum(["pending", "attended", "absent"]),
});

export async function updateAttendanceAction(
  activityId: string,
  returnTo: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin();
  const parsed = attendanceInputSchema.safeParse({
    attendanceIds: formData.getAll("attendance_ids"),
    notes: formData.get("notes") ?? "",
    status: formData.get("status"),
  });
  const fallback = `${ROUTES.adminAttendance}/${activityId}`;
  if (!parsed.success) redirect(withAdminResult(returnTo, fallback, "error-seleccion"));

  const client = await createServerSupabaseClient();
  const { error } = await client.rpc("set_attendance_status", {
    p_attendance_ids: parsed.data.attendanceIds,
    p_notes: parsed.data.notes || undefined,
    p_status: parsed.data.status,
  });
  if (error) redirect(withAdminResult(returnTo, fallback, "error-asistencia"));

  revalidatePath(fallback);
  revalidatePath(ROUTES.adminParticipants);
  redirect(withAdminResult(returnTo, fallback, "asistencia-actualizada"));
}
