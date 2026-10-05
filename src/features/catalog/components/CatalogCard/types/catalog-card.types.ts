import type { ReactNode } from "react";

export interface CatalogCardProps {
  action: string;
  bannerUrl: string | null;
  children?: ReactNode;
  featured?: boolean;
  href: string;
  id: string;
  labels: ReactNode;
  metadata?: ReactNode;
  price: ReactNode;
  title: string;
}
