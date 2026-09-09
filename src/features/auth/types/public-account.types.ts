import type { PublicHeaderAccount } from "@/components/organisms/PublicHeader/types/public-header.types";

export interface PublicAccountContextValue {
  account: PublicHeaderAccount | null;
  isLoading: boolean;
}

export interface PublicAccountProviderProps {
  children: React.ReactNode;
}
