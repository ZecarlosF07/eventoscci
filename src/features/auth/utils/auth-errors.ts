import type { AuthError } from "@supabase/supabase-js";

export function signUpErrorMessage(error: AuthError): string {
  if (["email_exists", "user_already_exists"].includes(error.code ?? "")) {
    return "Este correo ya tiene una cuenta. Inicia sesión o recupera tu contraseña.";
  }
  if (error.message.includes("REGISTRATION_ACCOUNT_EXISTS")) {
    return "Este documento ya tiene una cuenta activa. Inicia sesión o recupera tu contraseña.";
  }
  if (error.message.includes("REGISTRATION_IDENTITY_INACTIVE")) {
    return "La ficha institucional está inactiva. Comunícate con la Cámara para regularizarla.";
  }
  return "No fue posible crear la cuenta. Verifica si el correo o documento ya están registrados.";
}

export function loginErrorMessage(code: string | undefined): string {
  if (code === "inactive") return "La cuenta está inactiva. Comunícate con la Cámara de Comercio de Ica.";
  if (code === "not-linked") return "La cuenta no está vinculada a una ficha institucional.";
  if (code === "confirmation") return "No fue posible confirmar el enlace. Solicita uno nuevo.";
  return "";
}
