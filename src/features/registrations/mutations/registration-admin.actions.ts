"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { ROUTES } from "@/constants/routes";
import { requireAdmin } from "@/features/auth/services/admin-session";
import { deliverNotificationImmediately } from "@/features/notifications/services/process-notifications";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { withAdminResult } from "@/utils/admin-return-url";

function didChange(data: unknown): boolean {
  return Boolean(data && typeof data === "object" && "changed" in data && data.changed);
}

function revalidateCertificateAdminPaths(activityId: string, returnTo: string): void {
  revalidatePath(ROUTES.adminRegistrations);
  revalidatePath("/admin/asistencia");
  revalidatePath(`${ROUTES.adminCertificatesActivities}/${activityId}`);
  revalidatePath(ROUTES.adminCertificatesActivities);
  if (returnTo.startsWith("/admin/")) revalidatePath(returnTo.split("?")[0]);
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
  const changed = didChange(data);
  let notificationDelivered = true;
  if (changed) {
    notificationDelivered = await deliverNotificationImmediately({
      eventType: "activity_paid_registration_confirmed",
      relatedEntityId: registrationId,
      relatedEntityType: "registration",
    });
  }
  revalidatePath(ROUTES.adminRegistrations);
  revalidatePath(ROUTES.adminPendingPayments);
  revalidatePath(ROUTES.adminParticipants);
  if (returnTo.startsWith("/admin/")) revalidatePath(returnTo.split("?")[0]);
  redirect(withAdminResult(
    returnTo,
    ROUTES.adminRegistrations,
    changed ? notificationDelivered ? "confirmada" : "confirmada-correo-fallido" : "ya-confirmada",
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
  revalidatePath(ROUTES.adminPendingPayments);
  revalidatePath(ROUTES.adminParticipants);
  if (returnTo.startsWith("/admin/")) revalidatePath(returnTo.split("?")[0]);
  redirect(withAdminResult(
    returnTo,
    ROUTES.adminRegistrations,
    didChange(data) ? "cancelada" : "ya-cancelada",
  ));
}

export async function registerCertificateRequestAdminAction(
  registrationId: string,
  activityId: string,
  returnTo: string,
): Promise<void> {
  await requireAdmin();
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("register_activity_certificate_request_admin", {
    p_registration_id: registrationId,
  });

  if (error) {
    redirect(withAdminResult(returnTo, ROUTES.adminRegistrations, "error-solicitud-certificado"));
  }

  revalidateCertificateAdminPaths(activityId, returnTo);
  redirect(withAdminResult(
    returnTo,
    ROUTES.adminRegistrations,
    didChange(data) ? "solicitud-certificado-registrada" : "solicitud-certificado-existente",
  ));
}

export async function verifyCertificatePaymentAction(
  registrationId: string,
  activityId: string,
  returnTo: string,
): Promise<void> {
  await requireAdmin();
  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("verify_activity_certificate_payment", {
    p_registration_id: registrationId,
  });

  if (error) {
    redirect(withAdminResult(returnTo, ROUTES.adminRegistrations, "error-pago-certificado"));
  }

  revalidateCertificateAdminPaths(activityId, returnTo);
  redirect(withAdminResult(
    returnTo,
    ROUTES.adminRegistrations,
    didChange(data) ? "pago-certificado-verificado" : "pago-certificado-ya-verificado",
  ));
}

export async function revertCertificatePaymentAction(
  registrationId: string,
  activityId: string,
  returnTo: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin();
  const reason = z.string().trim().min(3).max(500).safeParse(formData.get("reversal_reason"));
  if (!reason.success) {
    redirect(withAdminResult(returnTo, ROUTES.adminRegistrations, "error-motivo-reversion-certificado"));
  }

  const client = await createServerSupabaseClient();
  const { data, error } = await client.rpc("revert_activity_certificate_payment", {
    p_reason: reason.data,
    p_registration_id: registrationId,
  });

  if (error) {
    redirect(withAdminResult(returnTo, ROUTES.adminRegistrations, "error-revertir-pago-certificado"));
  }

  revalidateCertificateAdminPaths(activityId, returnTo);
  redirect(withAdminResult(
    returnTo,
    ROUTES.adminRegistrations,
    didChange(data) ? "pago-certificado-revertido" : "pago-certificado-pendiente",
  ));
}
