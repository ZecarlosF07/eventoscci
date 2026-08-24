import type { ActivityListItem } from "@/features/activities/types/activity.types";
import type { CourseListItem } from "@/features/courses/types/course.types";

export interface GlobalSearchResults {
  courses: CourseListItem[];
  events: ActivityListItem[];
  total: number;
  trainings: ActivityListItem[];
}

export interface GlobalSearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}
