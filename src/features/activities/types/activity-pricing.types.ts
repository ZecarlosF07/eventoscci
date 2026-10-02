import type { ReactNode } from "react";

export interface ActivityPricingConfig {
  generalPrice: number;
  isFree: boolean;
  memberPrice: number;
  presaleEndsAt?: string | null;
  presaleGeneralPrice?: number | null;
  presaleMemberPrice?: number | null;
  type?: "event" | "training";
}

export interface ActivityPricingRow {
  general_price: number;
  is_free: boolean;
  member_price: number;
  presale_ends_at?: string | null;
  presale_general_price?: number | null;
  presale_member_price?: number | null;
  type: "event" | "training";
}

export interface ActivityPriceQuote {
  amount: number;
  isPresale: boolean;
  regularAmount: number;
}

export interface ActivityPricingProviderProps {
  children: ReactNode;
  initialNow: number;
  pricing: ActivityPricingConfig;
}

export interface ActivityPricingContextValue {
  now: number;
  pricing: ActivityPricingConfig;
  refreshPricing: (pricing: ActivityPricingConfig) => void;
}

export interface RegistrationParticipationPricesProps {
  membersOnly: boolean;
}

export interface ActivityParticipationPricesProps {
  initialNow?: number;
  membersOnly: boolean;
  pricing: ActivityPricingConfig;
}
