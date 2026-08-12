import type { ReactNode } from "react";

export interface HeadingProps {
  children: ReactNode;
  className?: string;
  level?: 1 | 2 | 3 | 4;
}
