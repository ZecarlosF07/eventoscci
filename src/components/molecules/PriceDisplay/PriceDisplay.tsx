import { Badge } from "@/components/atoms/Badge";
import { Text } from "@/components/atoms/Text";
import type { PriceDisplayProps } from "@/components/molecules/PriceDisplay/types/price-display.types";
import { formatActivityPrice } from "@/features/activities/utils/activity-formatters";

export function PriceDisplay({
  generalPrice,
  isFree,
  memberPrice,
  membersOnly = false,
}: PriceDisplayProps) {
  if (isFree) return <Badge variant="success">Gratis</Badge>;

  if (membersOnly) return <Text className="font-semibold text-cci-950" size="sm">Asociados: {formatActivityPrice(memberPrice)}</Text>;

  return (
    <div className="space-y-1">
      <Text className="font-semibold text-cci-950" size="sm">
        General: {formatActivityPrice(generalPrice)}
      </Text>
      <Text size="sm">Asociados: {formatActivityPrice(memberPrice)}</Text>
    </div>
  );
}
