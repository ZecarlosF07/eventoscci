import type { ActivityDetail } from "@/features/activities/types/activity.types";
import type { RegistrationAvailability } from "@/features/registrations/types/registration.types";

export interface ActivityConversionPanelProps {
  activity: ActivityDetail;
  availability: RegistrationAvailability | null;
  initialNow: number;
}
