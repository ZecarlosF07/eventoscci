import type { ReactNode } from "react";

export interface AuthTemplateProps {
  children: ReactNode;
  description: string;
  eyebrow?: string;
  footer?: ReactNode;
  title: string;
}
