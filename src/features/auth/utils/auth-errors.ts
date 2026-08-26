import type { AuthError } from "@supabase/supabase-js";

import type { RegisterActionState } from "@/features/auth/types/auth.types";

export function getSignUpErrorState(error: AuthError): RegisterActionState {
  if (["email_exists", "user_already_exists"].includes(error.code ?? "")) {
    return { errors: { email: ["Este correo ya tiene una cuenta. Inicia sesión o recupera tu contraseña."] } };
  }
  if (error.code === "email_address_invalid") {
    return { errors: { email: ["El correo no puede recibir mensajes de confirmación. Verifica que esté escrito correctamente."] } };
  }
  if (error.code === "over_email_send_rate_limit") {
    return { message: "Se enviaron demasiadas solicitudes. Espera unos minutos antes de crear la cuenta nuevamente." };
  }
  if (error.code === "signup_disabled") {
    return { message: "El registro de nuevas cuentas está temporalmente deshabilitado. Comunícate con la Cámara." };
  }
  if (error.code === "email_provider_disabled") {
    return { message: "El envío de correos de confirmación está temporalmente deshabilitado. Comunícate con la Cámara." };
  }
  if (["over_request_rate_limit", "too_many_requests"].includes(error.code ?? "")) {
    return { message: "Se realizaron demasiados intentos desde este dispositivo. Espera unos minutos antes de volver a intentarlo." };
  }
  if ((error.message ?? "").toLowerCase().includes("fetch")) {
    return { message: "No fue posible conectar con el servicio de registro. Revisa tu conexión e inténtalo nuevamente." };
  }
  if (error.message.includes("REGISTRATION_ACCOUNT_EXISTS")) {
    return { errors: { document_number: ["Este documento ya tiene una cuenta activa. Inicia sesión o recupera tu contraseña."] } };
  }
  if (error.message.includes("REGISTRATION_IDENTITY_INACTIVE")) {
    return { errors: { document_number: ["La ficha institucional está inactiva. Comunícate con la Cámara para regularizarla."] } };
  }
  return { message: "No fue posible crear la cuenta por un error del servicio. Tus datos permanecen en el formulario; inténtalo nuevamente o comunícate con la Cámara." };
}

export function loginErrorMessage(code: string | undefined): string {
  if (code === "inactive") return "La cuenta está inactiva. Comunícate con la Cámara de Comercio de Ica.";
  if (code === "not-linked") return "La cuenta no está vinculada a una ficha institucional.";
  if (code === "confirmation") return "No fue posible confirmar el enlace. Solicita uno nuevo.";
  return "";
}
