"use client";

import { Checkbox } from "@/components/atoms/Checkbox";
import { Label } from "@/components/atoms/Label";
import type { ActivityStudentRegistrationFieldProps } from "@/features/activities/components/ActivityStudentRegistrationField/types/activity-student-registration-field.types";

export function ActivityStudentRegistrationField({ allowed, error, onChange, visible }: ActivityStudentRegistrationFieldProps) {
  return <>
    <input name="allows_student_registration" type="hidden" value={String(allowed)} />
    {visible ? <div className="rounded-2xl border border-cci-100 p-4">
      <Label className="flex min-h-11 cursor-pointer items-center gap-3" htmlFor="allows_student_registration">
        <Checkbox aria-describedby="student-registration-hint" checked={allowed} id="allows_student_registration" onChange={(event) => onChange(event.target.checked)} />
        Permitir inscripciones de estudiantes
      </Label>
      <p className="mt-1 text-sm leading-6 text-slate-600" id="student-registration-hint">Si lo desactivas, solo se aceptarán inscripciones con perfil Profesional o empresario.</p>
      {error ? <p className="mt-1 text-sm text-rose-700" role="alert">{error}</p> : null}
    </div> : null}
  </>;
}
