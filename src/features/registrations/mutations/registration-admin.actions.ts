"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { requireAdmin } from "@/features/auth/services/admin-session";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { withAdminResult } from "@/utils/admin-return-url";

function didChange(data: unknown): boolean {
  return Boolean(data && typeof data === "object" && "changed" in data && data.changed);
}

export async function confirmRegistrationAction(
  registrationId: string,
  returnTo: string,
): Promise<void> {
  await requireAdmin();
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("confirm_registration", {
    p_registration_id: registrationId,
  });

  if (error) redirect(withAdminResult(returnTo, ROUTES.adminRegistrations, "error-confirmar"));
  revalidatePath(ROUTES.adminRegistrations);
  revalidatePath(ROUTES.adminParticipants);
  redirect(withAdminResult(
    returnTo,
    ROUTES.adminRegistrations,
    didChange(data) ? "confirmada" : "ya-confirmada",
  ));
}

export async function cancelRegistrationAction(
  registrationId: string,
  returnTo: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin();
  const reasonValue = formData.get("cancellation_reason");
  const reason = typeof reasonValue === "string" ? reasonValue.trim().slice(0, 500) : "";
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("cancel_registration", {
    p_reason: reason || undefined,
    p_registration_id: registrationId,
  });

  if (error) redirect(withAdminResult(returnTo, ROUTES.adminRegistrations, "error-cancelar"));
  revalidatePath(ROUTES.adminRegistrations);
  revalidatePath(ROUTES.adminParticipants);
  redirect(withAdminResult(
    returnTo,
    ROUTES.adminRegistrations,
    didChange(data) ? "cancelada" : "ya-cancelada",
  ));
}
