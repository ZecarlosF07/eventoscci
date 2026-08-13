import type { CurrentAccount } from "@/features/auth/types/auth.types";

export interface UserMenuProps {
  account: CurrentAccount | null;
}
