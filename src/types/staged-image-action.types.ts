import type { StagedImageField } from "@/features/media/types/staged-image.types";
import type { StatefulServerAction } from "@/types/persistent-action.types";

export interface StagedImageActionState {
  errors?: Record<string, string[]>;
  message?: string;
}

export interface StagedImageActionOptions<State> {
  action: StatefulServerAction<State>;
  bucket: string;
  fields: StagedImageField[];
  initialState: State;
}

