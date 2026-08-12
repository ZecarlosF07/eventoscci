import type { HTMLAttributes } from "react";

export type BadgeVariant = "neutral" | "success" | "warning";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}
