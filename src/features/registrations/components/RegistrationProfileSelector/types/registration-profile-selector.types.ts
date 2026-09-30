import type { ParticipantProfile } from "@/features/registrations/types/registration.types";

export interface RegistrationProfileSelectorProps {
  allowsStudentRegistration?: boolean;
  onChange: (profile: ParticipantProfile) => void;
  value: ParticipantProfile;
}
