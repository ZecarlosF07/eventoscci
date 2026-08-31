import type { PublicHeaderAccount, PublicHeaderTone } from "@/components/organisms/PublicHeader/types/public-header.types";

export interface UserMenuProps {
  account: PublicHeaderAccount | null;
  layout?: "desktop" | "mobile";
  onNavigate?: () => void;
  tone?: PublicHeaderTone;
}
