import type { NavigationItem } from "@/types/navigation.types";

export type NavigationLinksVariant = "admin" | "public" | "workspace";

export interface NavigationLinksProps {
  items: NavigationItem[];
  variant?: NavigationLinksVariant;
}
