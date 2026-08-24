import { Text } from "@/components/atoms/Text";
import type { ActivityDateProps } from "@/components/molecules/ActivityDate/types/activity-date.types";
import { formatActivityDate } from "@/features/activities/utils/activity-formatters";

export function ActivityDate({ date }: ActivityDateProps) {
  return (
    <div className="rounded-xl border border-cci-100 bg-white p-4">
      {date.label ? (
        <Text className="font-semibold text-cci-950" size="sm">
          {date.label}
        </Text>
      ) : null}
      <Text size="sm">
        {formatActivityDate(date.starts_at)}
        {date.ends_at ? ` — ${formatActivityDate(date.ends_at)}` : ""}
      </Text>
    </div>
  );
}
