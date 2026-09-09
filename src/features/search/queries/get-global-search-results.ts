import "server-only";

import { getPublicActivityPage } from "@/features/activities/queries/get-public-activities";
import { getPublishedCoursePage } from "@/features/courses/queries/get-public-courses";
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

  const [eventPage, trainingPage, coursePage] = await Promise.all([
    getPublicActivityPage("event", { page: 1, query: normalizedQuery }),
    getPublicActivityPage("training", { page: 1, query: normalizedQuery }),
    getPublishedCoursePage({ page: 1, query: normalizedQuery }),
  ]);

  return {
    courses: coursePage.courses,
    events: eventPage.activities,
    total: eventPage.total + trainingPage.total + coursePage.total,
    trainings: trainingPage.activities,
  };
}
