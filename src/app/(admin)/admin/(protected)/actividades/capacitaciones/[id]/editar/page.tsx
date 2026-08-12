import { notFound } from "next/navigation";

import { ActivityAdminFormTemplate } from "@/components/templates/ActivityAdminFormTemplate";
import { getAdminActivityById } from "@/features/activities/queries/get-admin-activity";
import { getActivityFormOptions } from "@/features/activities/services/get-activity-form-options";
import type { AdminActivityEditPageProps } from "@/features/activities/types/activity-page.types";

export default async function EditTrainingPage({ params, searchParams }: AdminActivityEditPageProps) {
  const { id } = await params;
  const [activity, options, query] = await Promise.all([getAdminActivityById(id), getActivityFormOptions(), searchParams]);
  if (!activity || activity.type !== "training") notFound();
  return <ActivityAdminFormTemplate activity={activity} categories={options.categories} saved={query.guardado === "1"} speakers={options.speakers} type="training" />;
}
