"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/constants/routes";
import { requireActiveAccount } from "@/features/auth/services/account-guards";
import { formText } from "@/features/auth/utils/auth-form-data";
import { profileSchema } from "@/features/users/schemas/profile.schema";
import type { ProfileActionState } from "@/features/users/types/user-profile.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseErrorMessage, logSupabaseError } from "@/lib/supabase/supabase-error";

export async function updateProfileAction(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  await requireActiveAccount();
  const parsed = profileSchema.safeParse({
    address: formText(formData, "address"),
    company: formText(formData, "company"),
    first_names: formText(formData, "first_names"),
    job_title: formText(formData, "job_title"),
    last_names: formText(formData, "last_names"),
    phone: formText(formData, "phone"),
    ruc: formText(formData, "ruc"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const client = await createServerSupabaseClient();
  const { error } = await client.rpc("update_own_profile", { p_profile: parsed.data });
  if (error) {
    logSupabaseError("profile_update_failed", error);
    return {
      message: getSupabaseErrorMessage(error, {
        fallback: "No se pudo actualizar tu perfil. Revisa tu conexión e inténtalo nuevamente.",
        messages: {
          ACCOUNT_NOT_ACTIVE: "Tu cuenta está inactiva. Comunícate con la Cámara para actualizar tus datos.",
          PROFILE_NOT_FOUND: "No encontramos tu ficha institucional. Comunícate con la Cámara para regularizarla.",
          PROFILE_VALIDATION_ERROR: "Uno o más datos no cumplen las reglas de tu perfil. Revisa los campos indicados.",
        },
      }),
    };
  }
  revalidatePath(ROUTES.campus, "layout");
  return { message: "Perfil actualizado correctamente.", success: true };
}
