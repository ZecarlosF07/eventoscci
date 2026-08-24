export type LogLevel = "error" | "info" | "warn";

export interface LogContext {
  [key: string]: boolean | number | string | null | undefined;
}
