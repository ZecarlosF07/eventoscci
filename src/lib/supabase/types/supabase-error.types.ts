import type { LogContext } from "@/lib/observability/types/logger.types";

export interface SupabaseErrorLike {
  code?: string;
  message?: string;
  name?: string;
  status?: number | string;
  statusCode?: number | string;
}

export interface SupabaseErrorMessageOptions {
  fallback: string;
  messages?: Record<string, string>;
}

export interface SupabaseErrorLogContext extends LogContext {
  errorCode?: string;
  errorMessage?: string;
  errorName?: string;
  errorStatus?: number | string;
}
