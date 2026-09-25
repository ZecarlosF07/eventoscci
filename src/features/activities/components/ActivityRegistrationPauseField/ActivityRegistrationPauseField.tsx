"use client";

import { Checkbox } from "@/components/atoms/Checkbox";
import { Label } from "@/components/atoms/Label";
import type { ActivityRegistrationPauseFieldProps } from "@/features/activities/components/ActivityRegistrationPauseField/types/activity-registration-pause-field.types";

export function ActivityRegistrationPauseField({
  checked,
  onChange,
  visible,
}: ActivityRegistrationPauseFieldProps) {
  if (!visible) {
    return checked ? <input name="registrations_closed_manually" type="hidden" value="on" /> : null;
  }

  return (
    <div className="rounded-2xl border border-cci-100 bg-cci-50 p-4">
      <Label className="flex min-h-11 cursor-pointer items-center gap-3" htmlFor="registrations_closed_manually">
        <Checkbox checked={checked} id="registrations_closed_manually" name="registrations_closed_manually" onChange={(event) => onChange(event.target.checked)} />
        Pausar nuevas inscripciones
      </Label>
      <p className="mt-1 text-sm leading-6 text-slate-600">
        Detiene los nuevos registros aunque el plazo siga abierto. No cancela las inscripciones existentes. Desmárcalo para reabrir, si aún hay plazo y cupos.
      </p>
    </div>
  );
}
