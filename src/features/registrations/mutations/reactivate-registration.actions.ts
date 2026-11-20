"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { ROUTES } from "@/constants/routes";
import { requireAdmin } from "@/features/auth/services/admin-session";
import { PUBLIC_CACHE_TAGS } from "@/features/seo/constants/public-cache.constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logSupabaseError, matchesSupabaseError } from "@/lib/supabase/supabase-error";
import { withAdminResult } from "@/utils/admin-return-url";

export async function reactivateRegistrationAction(registrationId: string, returnTo: string, formData: FormData): Promise<void> {
  await requireAdmin();
  const reason = z.string().trim().max(500).safeParse(formData.get("reactivation_reason") ?? "");
  if (!z.uuid().safeParse(registrationId).success || !reason.success) {
    redirect(withAdminResult(returnTo, ROUTES.adminRegistrations, "error-reactivar"));
  }
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("reactivate_registration", {
    p_registration_id: registrationId, p_reason: reason.data || undefined,
  });
  if (error) {
    logSupabaseError("registration_reactivation_failed", error, { registrationId });
    const result = matchesSupabaseError(error, "NO_AVAILABLE_CAPACITY") ? "error-reactivar-cupo"
      : matchesSupabaseError(error, "DUPLICATE_REGISTRATION") ? "error-reactivar-duplicada"
        : matchesSupabaseError(error, "COMPLIMENTARY_PASS_NOT_ASSIGNED") ? "error-reactivar-pase"
          : matchesSupabaseError(error, "ACTIVITY_NOT_AVAILABLE") ? "error-reactivar-actividad" : "error-reactivar";
    redirect(withAdminResult(returnTo, ROUTES.adminRegistrations, result));
  }
  const parsed = z.object({ changed: z.boolean(), activity_id: z.uuid(), status: z.enum(["pending", "confirmed"]) }).safeParse(data);
  if (!parsed.success) redirect(withAdminResult(returnTo, ROUTES.adminRegistrations, "error-reactivar"));
  updateTag(PUBLIC_CACHE_TAGS.availability);
  revalidatePath("/admin/inscripciones", "layout");
  revalidatePath(ROUTES.adminPendingPayments);
  revalidatePath(ROUTES.adminParticipants);
  revalidatePath("/admin/asistencia", "layout");
  revalidatePath(`${ROUTES.adminCertificatesActivities}/${parsed.data.activity_id}`);
  if (returnTo.startsWith("/admin/")) revalidatePath(returnTo.split("?")[0]);
  const result = !parsed.data.changed ? "ya-reactivada"
    : parsed.data.status === "confirmed" ? "reactivada-confirmada" : "reactivada-pendiente";
  redirect(withAdminResult(returnTo, ROUTES.adminRegistrations, result));
}
