import type { FoundationConnectionStatus } from "@/features/foundation/types/foundation-status.types";

export interface ConnectionNoticeProps {
  message: string;
  status: FoundationConnectionStatus;
}
