import { ActivityAdminFormTemplate } from "@/components/templates/ActivityAdminFormTemplate";
import { getActivityFormOptions } from "@/features/activities/services/get-activity-form-options";

export default async function NewEventPage() {
  const options = await getActivityFormOptions();
  return <ActivityAdminFormTemplate {...options} type="event" />;
}
