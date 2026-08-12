import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "subtle";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}
