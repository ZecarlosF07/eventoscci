import type { ReactNode } from "react";

export interface FormFieldProps {
  children: ReactNode;
  error?: string;
  hint?: string;
  label: string;
  name: string;
  required?: boolean;
  tone?: "dark" | "light";
}
