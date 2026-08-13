"use server";

import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { getAccountForUser } from "@/features/auth/queries/get-current-account";
import { loginSchema } from "@/features/auth/schemas/login.schema";
import type { LoginActionState } from "@/features/auth/types/auth.types";
import { formText } from "@/features/auth/utils/auth-form-data";
import { safeAuthRedirect } from "@/features/auth/utils/safe-auth-redirect";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    email: formText(formData, "email"),
    password: formText(formData, "password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const client = await createServerSupabaseClient();
  const { data, error: loginError } = await client.auth.signInWithPassword(parsed.data);

  if (loginError) {
    return { message: "El correo o la contraseña no son correctos." };
  }

  const account = data.user ? await getAccountForUser(client, data.user) : null;
  if (!account) {
    await client.auth.signOut();
    return { message: "La cuenta no está vinculada a una ficha institucional." };
  }
  if (!account.isActive) {
    await client.auth.signOut();
    return { message: "La cuenta está inactiva. Comunícate con la Cámara." };
  }

  const fallback = account.role === "student" ? ROUTES.campus : ROUTES.admin;
  const requested = safeAuthRedirect(formText(formData, "next"), fallback);
  const destination = account.role === "student" ? ROUTES.campus : requested;

  redirect(destination);
}

export async function logoutAction(): Promise<void> {
  const client = await createServerSupabaseClient();
  await client.auth.signOut();
  redirect(ROUTES.home);
}
