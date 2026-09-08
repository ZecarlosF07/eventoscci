import type { ActivityDetail } from "@/features/activities/types/activity.types";

export interface ActivityContentFieldsProps {
  activity?: Pick<ActivityDetail, "banner_path" | "program" | "program_image_paths" | "syllabus">;
  bannerError?: string;
  programError?: string;
}
