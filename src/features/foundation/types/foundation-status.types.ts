import type { CategorySummary } from "@/features/categories/types/category.types";
import type { SpeakerSummary } from "@/features/speakers/types/speaker.types";

export type FoundationConnectionStatus =
  | "connected"
  | "error"
  | "unconfigured";

export interface FoundationStatus {
  categories: CategorySummary[];
  message: string;
  speakers: SpeakerSummary[];
  status: FoundationConnectionStatus;
}
