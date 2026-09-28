"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { ROUTES } from "@/constants/routes";
import type { AttendanceWorkspaceResult } from "@/features/attendance/types/attendance.types";
import { requireAdmin } from "@/features/auth/services/admin-session";
import { deliverActivityCertificateOffers } from "@/features/notifications/services/process-notifications";
import { getActivityAttendanceRoute } from "@/features/participation/utils/participation-routes";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { withAdminResult } from "@/utils/admin-return-url";

const attendanceInputSchema = z.object({
  attendanceIds: z.array(z.uuid()).min(1).max(500),
  notes: z.string().trim().max(500),
  status: z.enum(["pending", "attended", "absent"]),
});

export async function updateAttendanceWorkspaceAction(activityId: string, formData: FormData): Promise<AttendanceWorkspaceResult> {
  await requireAdmin();
  const parsed = attendanceInputSchema.safeParse({ attendanceIds: [...new Set(formData.getAll("attendance_ids"))], notes: formData.get("notes") ?? "", status: formData.get("status") });
  if (!z.uuid().safeParse(activityId).success || !parsed.success) return { success: false, resultCode: "error-seleccion", message: "Revisa la selección, el estado y la nota. No se modificó la asistencia." };
  const client = await createServerSupabaseClient();
  const scope = await client.from("attendance").select("id, registration:registrations!inner(activity_id)")
    .in("id", parsed.data.attendanceIds).eq("registration.activity_id", activityId)
    .is("deleted_at", null).is("registration.deleted_at", null);
  if (scope.error || scope.data.length !== parsed.data.attendanceIds.length) return { success: false, resultCode: "error-seleccion", message: "La selección contiene registros eliminados o de otra actividad. Revisa los seleccionados." };
  const { error } = await client.rpc("set_attendance_status", { p_attendance_ids: parsed.data.attendanceIds, p_notes: parsed.data.notes || undefined, p_status: parsed.data.status });
  if (error) return { success: false, resultCode: error.message.includes("ACTIVITY_ARCHIVED") ? "error-actividad-archivada" : error.message.includes("REGISTRATION_NOT_CONFIRMED") ? "error-inscripcion-no-confirmada" : "error-asistencia", message: "No se modificó la asistencia. Comprueba que la actividad esté operativa y todos los seleccionados sigan confirmados." };
  revalidatePath(getActivityAttendanceRoute(activityId));
  revalidatePath(ROUTES.adminParticipants);
  revalidatePath(ROUTES.adminRegistrations);
  const delivered = parsed.data.status !== "attended" || await deliverActivityCertificateOffers(parsed.data.attendanceIds);
  return { success: true, resultCode: delivered ? "asistencia-actualizada" : "asistencia-actualizada-correo-fallido", message: delivered ? "Asistencia actualizada. Se retiraron los participantes procesados de la selección." : "Asistencia actualizada; algunas comunicaciones quedaron pendientes de reintento." };
}

export async function updateAttendanceAction(
  activityId: string,
  returnTo: string,
  formData: FormData,
): Promise<void> {
  const result = await updateAttendanceWorkspaceAction(activityId, formData);
  redirect(withAdminResult(returnTo, getActivityAttendanceRoute(activityId), result.resultCode ?? "error-asistencia"));
}
