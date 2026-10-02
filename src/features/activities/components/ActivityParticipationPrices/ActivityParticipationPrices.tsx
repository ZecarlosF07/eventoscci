"use client";

import { usePricingClock } from "@/features/activities/hooks/use-pricing-clock";
import type { ActivityParticipationPricesProps } from "@/features/activities/types/activity-pricing.types";
import { formatActivityPrice } from "@/features/activities/utils/activity-formatters";
import { formatPresaleDeadline, getActivityPrice } from "@/features/activities/utils/activity-pricing";

export function ActivityParticipationPrices({ initialNow, membersOnly, pricing }: ActivityParticipationPricesProps) {
  const now = usePricingClock(pricing.presaleEndsAt, initialNow);
  if (pricing.isFree) return <strong className="block text-2xl text-cci-950">Gratis</strong>;
  const audiences = membersOnly ? ["member"] as const : ["general", "member"] as const;
  return <div className={membersOnly ? "space-y-3" : "grid gap-4 sm:grid-cols-2"}>
    {audiences.map((audience) => {
      const quote = getActivityPrice(pricing, audience, now);
      return <div key={audience} className="min-w-0">
        {!membersOnly ? <p className="mb-1 text-sm text-slate-600">{audience === "general" ? "Público general" : "Asociados"}</p> : null}
        {quote.isPresale && pricing.presaleEndsAt ? <div><p className="text-xl font-bold text-cci-950">{formatActivityPrice(quote.amount)} <span className="text-base font-medium">preventa</span></p><p className="text-sm text-slate-600">Hasta el {formatPresaleDeadline(pricing.presaleEndsAt)}</p></div> : null}
        <p className={quote.isPresale ? "mt-2 text-base text-slate-600" : "text-xl font-bold text-cci-950"}>{formatActivityPrice(quote.regularAmount)} <span className="text-sm font-normal">precio regular</span></p>
      </div>;
    })}
  </div>;
}
