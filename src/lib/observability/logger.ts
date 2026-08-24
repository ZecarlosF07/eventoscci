import "server-only";

import type { LogContext, LogLevel } from "@/lib/observability/types/logger.types";

function writeLog(level: LogLevel, event: string, context: LogContext = {}): void {
  const entry = JSON.stringify({
    ...context,
    environment: process.env.NODE_ENV,
    event,
    level,
    service: "eventoscci",
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION ?? process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
  });

  if (level === "error") console.error(entry);
  else if (level === "warn") console.warn(entry);
  else console.info(entry);
}

export const logger = {
  error: (event: string, context?: LogContext) => writeLog("error", event, context),
  info: (event: string, context?: LogContext) => writeLog("info", event, context),
  warn: (event: string, context?: LogContext) => writeLog("warn", event, context),
};
