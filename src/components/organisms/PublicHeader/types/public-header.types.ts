import type { UserRole } from "@/features/auth/types/auth.types";

export interface PublicHeaderAccount {
  email: string;
  firstName: string;
  isActive: boolean;
  lastName: string;
  role: UserRole;
}

export type PublicHeaderTone = "default" | "inverse";
