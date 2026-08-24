import "server-only";

import { getPublicActivities } from "@/features/activities/queries/get-public-activities";
import { getPublishedCourses } from "@/features/courses/queries/get-admin-courses";
import type { GlobalSearchResults } from "@/features/search/types/search.types";

const EMPTY_RESULTS: GlobalSearchResults = {
  courses: [],
  events: [],
  total: 0,
  trainings: [],
};

export async function getGlobalSearchResults(query: string): Promise<GlobalSearchResults> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return EMPTY_RESULTS;

  const [events, trainings, courses] = await Promise.all([
    getPublicActivities("event", { query: normalizedQuery }),
    getPublicActivities("training", { query: normalizedQuery }),
    getPublishedCourses(normalizedQuery),
  ]);

  return {
    courses,
    events,
    total: events.length + trainings.length + courses.length,
    trainings,
  };
}
