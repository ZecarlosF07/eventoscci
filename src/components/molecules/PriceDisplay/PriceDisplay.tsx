import { Badge } from "@/components/atoms/Badge";
import { Text } from "@/components/atoms/Text";
import type { PriceDisplayProps } from "@/components/molecules/PriceDisplay/types/price-display.types";
import { formatActivityPrice } from "@/features/activities/utils/activity-formatters";

export function PriceDisplay({
  generalPrice,
  isFree,
  memberPrice,
}: PriceDisplayProps) {
  if (isFree) return <Badge variant="success">Gratis</Badge>;

  return (
    <div className="space-y-1">
      <Text className="font-semibold text-cci-950" size="sm">
        General: {formatActivityPrice(generalPrice)}
      </Text>
      <Text size="sm">Asociados: {formatActivityPrice(memberPrice)}</Text>
    </div>
  );
}
