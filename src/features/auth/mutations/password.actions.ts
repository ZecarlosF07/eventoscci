"use server";

import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { forgotPasswordSchema, resetPasswordSchema } from "@/features/auth/schemas/password.schema";
import type { PasswordActionState } from "@/features/auth/types/auth.types";
import { formText } from "@/features/auth/utils/auth-form-data";
import { getSiteUrl } from "@/lib/env/server-env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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
  if (error) return { message: "No fue posible iniciar la recuperación. Intenta nuevamente." };
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
  if (error) return { message: "No fue posible actualizar la contraseña. Solicita un enlace nuevo." };
  redirect(ROUTES.campus);
}
