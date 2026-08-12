import type { ActivitySpeakerInput } from "@/features/activities/types/activity-form.types";

export interface ActivitySpeakerFieldsProps {
  initialSpeakers: ActivitySpeakerInput[];
  speakers: Array<{
    first_names: string;
    id: string;
    last_names: string;
    organization: string | null;
  }>;
}
