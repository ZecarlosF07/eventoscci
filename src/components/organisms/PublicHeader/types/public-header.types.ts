import type { UserRole } from "@/features/auth/types/auth.types";

export interface PublicHeaderAccount {
  email: string;
  firstName: string;
  isActive: boolean;
  lastName: string;
  role: UserRole;
}

export interface PublicHeaderClientProps {
  account: PublicHeaderAccount | null;
}

export type PublicHeaderTone = "default" | "inverse";
