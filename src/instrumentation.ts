import { logger } from "@/lib/observability/logger";

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    logger.info("application_started");
  }
}
