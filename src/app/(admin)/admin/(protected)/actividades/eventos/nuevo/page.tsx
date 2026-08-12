import { ActivityAdminFormTemplate } from "@/components/templates/ActivityAdminFormTemplate";
import { getActivityFormOptions } from "@/features/activities/services/get-activity-form-options";

export default async function NewEventPage() {
  const { categories, speakers } = await getActivityFormOptions();
  return <ActivityAdminFormTemplate categories={categories} speakers={speakers} type="event" />;
}
