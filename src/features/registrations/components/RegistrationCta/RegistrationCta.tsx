import Link from "next/link";

import { Text } from "@/components/atoms/Text";
import { REGISTRATION_AVAILABILITY_LABELS } from "@/features/registrations/constants/registration.constants";
import type { RegistrationCtaProps } from "@/features/registrations/types/registration.types";
import { getRegistrationRoute } from "@/features/registrations/utils/registration-routes";

export function RegistrationCta({
  activitySlug,
  activityType,
  availability,
}: RegistrationCtaProps) {
  if (!availability.is_open) {
    return (
      <div className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-600">
        {REGISTRATION_AVAILABILITY_LABELS[availability.reason]}
      </div>
    );
  }

  return (
    <div>
      <Link
        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        href={getRegistrationRoute(activityType, activitySlug)}
      >
        Inscribirme
      </Link>
      {availability.remaining_capacity !== null ? (
        <Text className="mt-2 text-center" size="sm">
          {availability.remaining_capacity} cupos disponibles
        </Text>
      ) : null}
    </div>
  );
}
