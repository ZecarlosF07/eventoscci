"use server";

import { redirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { registerSchema } from "@/features/auth/schemas/register.schema";
import type { RegisterActionState } from "@/features/auth/types/auth.types";
import { formText, registrationMetadata } from "@/features/auth/utils/auth-form-data";
import { getSignUpErrorState } from "@/features/auth/utils/auth-errors";
import { safeAuthRedirect } from "@/features/auth/utils/safe-auth-redirect";
import { getSiteUrl } from "@/lib/env/server-env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logSupabaseError } from "@/lib/supabase/supabase-error";

export async function registerAction(
  _previousState: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> {
  const parsed = registerSchema.safeParse({
    address: formText(formData, "address"),
    company: formText(formData, "company"),
    confirm_password: formText(formData, "confirm_password"),
    document_number: formText(formData, "document_number"),
    document_type: formText(formData, "document_type"),
    email: formText(formData, "email"),
    first_names: formText(formData, "first_names"),
    job_title: formText(formData, "job_title"),
    last_names: formText(formData, "last_names"),
    password: formText(formData, "password"),
    phone: formText(formData, "phone"),
    ruc: formText(formData, "ruc"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const { email, password } = parsed.data;
  const destination = safeAuthRedirect(formText(formData, "next"), ROUTES.campus);
  const profile = {
    address: parsed.data.address,
    company: parsed.data.company,
    document_number: parsed.data.document_number,
    document_type: parsed.data.document_type,
    first_names: parsed.data.first_names,
    job_title: parsed.data.job_title,
    last_names: parsed.data.last_names,
    phone: parsed.data.phone,
    ruc: parsed.data.ruc,
  };
  const client = await createServerSupabaseClient();
  const { data, error } = await client.auth.signUp({
    email,
    options: {
      data: registrationMetadata(profile),
      emailRedirectTo: `${getSiteUrl()}${ROUTES.authConfirm}?next=${encodeURIComponent(destination)}`,
    },
    password,
  });
  if (error) {
    logSupabaseError("account_registration_failed", error);
    return getSignUpErrorState(error);
  }
  if (!data.user?.identities?.length) {
    return { errors: { email: ["Este correo ya tiene una cuenta. Inicia sesión o recupera tu contraseña."] } };
  }
  if (data.session) redirect(destination);
  return {
    message: "Cuenta creada. Revisa tu correo para confirmar el acceso al Campus.",
    success: true,
  };
}
