"use server";

import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { loginSchema } from "@/features/auth/schemas/login.schema";
import type { LoginActionState } from "@/features/auth/types/auth.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const client = await createServerSupabaseClient();
  const { error: loginError } = await client.auth.signInWithPassword(parsed.data);

  if (loginError) {
    return { message: "El correo o la contraseña no son correctos." };
  }

  const { data: isAdmin, error: roleError } = await client.rpc(
    "is_active_admin",
  );

  if (roleError || !isAdmin) {
    await client.auth.signOut();
    return { message: "Esta cuenta no tiene acceso administrativo activo." };
  }

  redirect(ROUTES.admin);
}

export async function logoutAction(): Promise<void> {
  const client = await createServerSupabaseClient();
  await client.auth.signOut();
  redirect(ROUTES.adminLogin);
}
