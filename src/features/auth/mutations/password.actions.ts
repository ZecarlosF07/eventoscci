"use server";

import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { forgotPasswordSchema, resetPasswordSchema } from "@/features/auth/schemas/password.schema";
import type { PasswordActionState } from "@/features/auth/types/auth.types";
import { formText } from "@/features/auth/utils/auth-form-data";
import { getSiteUrl } from "@/lib/env/server-env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseErrorMessage, logSupabaseError, matchesSupabaseError } from "@/lib/supabase/supabase-error";

export async function requestPasswordResetAction(
  _previousState: PasswordActionState,
  formData: FormData,
): Promise<PasswordActionState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formText(formData, "email") });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const client = await createServerSupabaseClient();
  const { error } = await client.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getSiteUrl()}${ROUTES.authCallback}?next=${encodeURIComponent(ROUTES.resetPassword)}`,
  });
  if (error) {
    logSupabaseError("password_reset_request_failed", error);
    if (matchesSupabaseError(error, "RATE LIMIT")) {
      return { message: "Ya solicitaste un enlace recientemente. Espera unos minutos antes de intentarlo nuevamente." };
    }
    return {
      message: getSupabaseErrorMessage(error, {
        fallback: "No se pudo iniciar la recuperación. Revisa tu conexión e inténtalo nuevamente.",
      }),
    };
  }
  return {
    message: "Si el correo pertenece a una cuenta, recibirás un enlace para restablecerla.",
    success: true,
  };
}

export async function updatePasswordAction(
  _previousState: PasswordActionState,
  formData: FormData,
): Promise<PasswordActionState> {
  const parsed = resetPasswordSchema.safeParse({
    confirm_password: formText(formData, "confirm_password"),
    password: formText(formData, "password"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const client = await createServerSupabaseClient();
  const { data: userData } = await client.auth.getUser();
  if (!userData.user) return { message: "El enlace venció o no es válido. Solicita uno nuevo." };
  const { error } = await client.auth.updateUser({ password: parsed.data.password });
  if (error) {
    logSupabaseError("password_update_failed", error);
    if (matchesSupabaseError(error, "SAME_PASSWORD")) {
      return { errors: { password: ["La nueva contraseña debe ser distinta a la actual."] } };
    }
    if (matchesSupabaseError(error, "WEAK_PASSWORD")) {
      return { errors: { password: ["Usa una contraseña más segura con mayúscula, minúscula y número."] } };
    }
    return {
      message: getSupabaseErrorMessage(error, {
        fallback: "No se pudo actualizar la contraseña. El enlace puede haber vencido; solicita uno nuevo.",
      }),
    };
  }
  redirect(ROUTES.campus);
}
