import type { NavigationItem } from "@/types/navigation.types";

export type NavigationLinksVariant = "admin" | "public" | "workspace";
export type NavigationLinksTone = "default" | "inverse";

export interface NavigationLinksProps {
  items: NavigationItem[];
  onNavigate?: () => void;
  tone?: NavigationLinksTone;
  variant?: NavigationLinksVariant;
}
