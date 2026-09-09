import "server-only";

import { getFeaturedPublicActivities } from "@/features/activities/queries/get-public-activities";
import type { HomePageContent } from "@/features/home/types/home.types";
import { buildHomePageContent } from "@/features/home/utils/home-content";

export async function getHomePageContent(): Promise<HomePageContent> {
  const [events, trainings] = await Promise.all([
    getFeaturedPublicActivities("event"),
    getFeaturedPublicActivities("training"),
  ]);

  return buildHomePageContent(events, trainings);
}
