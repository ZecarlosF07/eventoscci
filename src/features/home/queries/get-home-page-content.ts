import "server-only";

import { getPublicActivities } from "@/features/activities/queries/get-public-activities";
import type { HomePageContent } from "@/features/home/types/home.types";
import { buildHomePageContent } from "@/features/home/utils/home-content";

export async function getHomePageContent(): Promise<HomePageContent> {
  const [events, trainings] = await Promise.all([
    getPublicActivities("event", {}),
    getPublicActivities("training", {}),
  ]);

  return buildHomePageContent(events, trainings);
}
