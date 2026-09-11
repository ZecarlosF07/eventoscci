import type {
  ActivityModality,
} from "@/features/activities/types/activity.types";
import type { RegistrationActivitySession } from "@/features/registrations/types/registration.types";

export interface VirtualActivityAccessProps {
  modality: ActivityModality;
  sessions: RegistrationActivitySession[];
  venueAddress: string | null;
  venueName: string | null;
  venueReference: string | null;
  virtualAccessUrl: string;
}
