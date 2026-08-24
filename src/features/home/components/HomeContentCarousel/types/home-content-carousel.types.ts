import type { ReactNode } from "react";

export interface HomeContentCarouselProps {
  ariaLabel: string;
  children: ReactNode;
  emptyState: ReactNode;
  header: ReactNode;
  tone?: "dark" | "light";
  viewAllHref: string;
  viewAllLabel: string;
}
