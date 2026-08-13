import type { PersonProfile } from "@/features/auth/types/auth.types";

export interface ProfileActionState {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
}

export interface ProfileFormProps {
  profile: PersonProfile;
}
