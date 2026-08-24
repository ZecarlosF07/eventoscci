import { checkDatabaseHealth } from "@/features/health/services/check-database-health";
import type { HealthResponse } from "@/features/health/types/health.types";
import { logger } from "@/lib/observability/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  let databaseHealthy = false;

  try {
    databaseHealthy = await checkDatabaseHealth();
  } catch {
    logger.error("health_check_configuration_failed");
  }

  const status = databaseHealthy ? "ok" : "degraded";
  const body: HealthResponse = {
    checks: { database: status },
    status,
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION ?? process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
  };

  if (!databaseHealthy) logger.warn("health_check_degraded", { database: status });

  return Response.json(body, {
    headers: { "Cache-Control": "no-store" },
    status: databaseHealthy ? 200 : 503,
  });
}
