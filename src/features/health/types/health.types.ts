export type HealthState = "degraded" | "ok";

export interface HealthResponse {
  checks: {
    database: HealthState;
  };
  status: HealthState;
  timestamp: string;
  version: string;
}
