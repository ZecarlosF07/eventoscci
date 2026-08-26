import "server-only";

import { logger } from "@/lib/observability/logger";
import type { LogContext } from "@/lib/observability/types/logger.types";
import type {
  SupabaseErrorLike,
  SupabaseErrorLogContext,
  SupabaseErrorMessageOptions,
} from "@/lib/supabase/types/supabase-error.types";

const DEFAULT_MESSAGES: Record<string, string> = {
  "22023": "Uno o más datos no cumplen las reglas de la plataforma. Revisa la información e inténtalo nuevamente.",
  "23503": "Uno de los registros relacionados ya no está disponible. Actualiza la página e inténtalo nuevamente.",
  "23505": "Ya existe un registro con los mismos datos. Revisa los campos únicos.",
  "23514": "Uno o más datos no cumplen las reglas de la plataforma. Revisa la información e inténtalo nuevamente.",
  "42501": "Tu sesión no tiene permisos para realizar esta acción. Vuelve a iniciar sesión o solicita acceso.",
  "57014": "La operación tardó demasiado. Inténtalo nuevamente en unos momentos.",
  PGRST301: "Tu sesión venció. Vuelve a iniciar sesión para continuar.",
};

function errorText(error: SupabaseErrorLike): string {
  return `${error.code ?? ""} ${error.name ?? ""} ${error.message ?? ""}`.toUpperCase();
}

export function matchesSupabaseError(error: SupabaseErrorLike, token: string): boolean {
  return errorText(error).includes(token.toUpperCase());
}

export function getSupabaseErrorMessage(
  error: SupabaseErrorLike,
  options: SupabaseErrorMessageOptions,
): string {
  const customMessage = Object.entries(options.messages ?? {})
    .find(([token]) => matchesSupabaseError(error, token))?.[1];
  if (customMessage) return customMessage;

  if (matchesSupabaseError(error, "FETCH") || matchesSupabaseError(error, "NETWORK")) {
    return "No fue posible conectar con el servicio. Revisa tu conexión e inténtalo nuevamente.";
  }
  return DEFAULT_MESSAGES[error.code ?? ""] ?? options.fallback;
}

export function logSupabaseError(
  event: string,
  error: SupabaseErrorLike,
  context: LogContext = {},
): void {
  const errorContext: SupabaseErrorLogContext = {
    ...context,
    errorCode: error.code,
    errorMessage: error.message,
    errorName: error.name,
    errorStatus: error.statusCode ?? error.status,
  };
  logger.error(event, errorContext);
}
