"use client";

import { Badge } from "@/components/atoms/Badge";
import { Text } from "@/components/atoms/Text";
import type { PriceDisplayProps } from "@/components/molecules/PriceDisplay/types/price-display.types";
import { usePricingClock } from "@/features/activities/hooks/use-pricing-clock";
import { formatActivityPrice } from "@/features/activities/utils/activity-formatters";
import { getActivityPrice } from "@/features/activities/utils/activity-pricing";

export function PriceDisplay({
  generalPrice,
  isFree,
  memberPrice,
  membersOnly = false,
  initialNow,
  ...presale
}: PriceDisplayProps) {
  const now = usePricingClock(presale.presaleEndsAt, initialNow);
  const pricing = { generalPrice, isFree, memberPrice, ...presale };
  const general = getActivityPrice(pricing, "general", now);
  const member = getActivityPrice(pricing, "member", now);
  if (isFree) return <Badge variant="success">Gratis</Badge>;

  if (membersOnly) return <Text className="font-semibold text-cci-950" size="sm">Asociados: {formatActivityPrice(member.amount)}{member.isPresale ? " · Preventa" : ""}</Text>;

  return (
    <div className="space-y-1">
      <Text className="font-semibold text-cci-950" size="sm">
        General: {formatActivityPrice(general.amount)}{general.isPresale ? " · Preventa" : ""}
      </Text>
      <Text size="sm">Asociados: {formatActivityPrice(member.amount)}{member.isPresale ? " · Preventa" : ""}</Text>
    </div>
  );
}
