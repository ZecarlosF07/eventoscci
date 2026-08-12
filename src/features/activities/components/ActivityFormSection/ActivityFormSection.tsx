import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import type { ActivityFormSectionProps } from "@/features/activities/components/ActivityFormSection/types/activity-form-section.types";

export function ActivityFormSection({
  children,
  description,
  title,
}: ActivityFormSectionProps) {
  return (
    <fieldset className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
      <div>
        <Heading level={3}>{title}</Heading>
        {description ? <Text className="mt-1" size="sm">{description}</Text> : null}
      </div>
      {children}
    </fieldset>
  );
}
