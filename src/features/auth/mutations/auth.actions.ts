"use server";

import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import {
  getAccountAccessForUser,
  getAccountForUser,
} from "@/features/auth/queries/get-current-account";
import { loginSchema } from "@/features/auth/schemas/login.schema";
import type { LoginActionState } from "@/features/auth/types/auth.types";
import { formText } from "@/features/auth/utils/auth-form-data";
import {
  safeAdminRedirect,
  safeAuthRedirect,
} from "@/features/auth/utils/safe-auth-redirect";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    email: formText(formData, "email"),
    password: formText(formData, "password"),
    portal: formText(formData, "portal") || "public",
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const client = await createServerSupabaseClient();
  const { email, password } = parsed.data;
  const { data, error: loginError } = await client.auth.signInWithPassword({ email, password });

  if (loginError) {
    return { message: "El correo o la contraseña no son correctos." };
  }

  const accountAccess = data.user ? await getAccountAccessForUser(client, data.user) : null;
  const isAdminPortal = parsed.data.portal === "admin";
  const deniedAdminAccess = isAdminPortal && accountAccess?.role === "student";
  if (deniedAdminAccess) {
    await client.auth.signOut();
    return { message: "El correo o la contraseña no son correctos." };
  }
  if (accountAccess && !accountAccess.isActive) {
    await client.auth.signOut();
    return { message: isAdminPortal ? "El correo o la contraseña no son correctos." : "La cuenta está inactiva. Comunícate con la Cámara." };
  }

  const account = data.user ? await getAccountForUser(client, data.user) : null;
  if (!account) {
    await client.auth.signOut();
    return { message: isAdminPortal ? "El correo o la contraseña no son correctos." : "La cuenta no está vinculada a una ficha institucional." };
  }
  const fallback = account.role === "student" ? ROUTES.campus : ROUTES.admin;
  const destination = isAdminPortal
    ? safeAdminRedirect(formText(formData, "next"))
    : safeAuthRedirect(formText(formData, "next"), fallback);

  redirect(destination);
}

export async function logoutAction(): Promise<void> {
  const client = await createServerSupabaseClient();
  await client.auth.signOut();
  redirect(ROUTES.home);
}
