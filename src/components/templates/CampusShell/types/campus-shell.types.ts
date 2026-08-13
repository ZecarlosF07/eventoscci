import type { ReactNode } from "react";

import type { CurrentAccount } from "@/features/auth/types/auth.types";

export interface CampusShellProps {
  account: CurrentAccount;
  children: ReactNode;
}
