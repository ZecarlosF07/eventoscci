"use client";

import Link from "next/link";

import { Text } from "@/components/atoms/Text";
import { REGISTRATION_AVAILABILITY_LABELS } from "@/features/registrations/constants/registration.constants";
import { trackAnalyticsEvent } from "@/features/analytics/services/track-analytics-event.client";
import type { RegistrationCtaProps } from "@/features/registrations/types/registration.types";
import { getRegistrationRoute } from "@/features/registrations/utils/registration-routes";

export function RegistrationCta({
  activityId,
  activitySlug,
  activityType,
  availability,
}: RegistrationCtaProps) {
  if (!availability.is_open) {
    return (
      <div className="rounded-xl border border-slate-300 bg-white px-4 py-4 text-center text-base font-semibold text-slate-700">
        {REGISTRATION_AVAILABILITY_LABELS[availability.reason]}
      </div>
    );
  }

  return (
    <div>
      <Link
        className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-cci-lime px-5 py-3 text-lg font-bold text-cci-950 shadow-md shadow-cci-950/15 transition hover:bg-[#C5F488] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-cci-950"
        href={getRegistrationRoute(activityType, activitySlug)}
        onClick={() => trackAnalyticsEvent("registration_cta_clicked", { activity_id: activityId, activity_type: activityType })}
      >
        Inscribirme <span aria-hidden="true">→</span>
      </Link>
      {availability.remaining_capacity !== null ? (
        <Text className="mt-2 text-center font-medium" size="md">
          {availability.remaining_capacity} cupos disponibles
        </Text>
      ) : null}
    </div>
  );
}
