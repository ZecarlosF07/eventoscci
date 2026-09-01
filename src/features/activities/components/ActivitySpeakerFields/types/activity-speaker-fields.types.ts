import type { ActivitySpeakerInput } from "@/features/activities/types/activity-form.types";
import type { SpeakerSummary } from "@/features/speakers/types/speaker.types";

export interface ActivitySpeakerFieldsProps {
  initialSpeakers: ActivitySpeakerInput[];
  speakers: SpeakerSummary[];
}
