import type { ParticipantProfile } from "@/features/registrations/types/registration.types";

export interface RegistrationProfileSelectorProps {
  onChange: (profile: ParticipantProfile) => void;
  value: ParticipantProfile;
}
