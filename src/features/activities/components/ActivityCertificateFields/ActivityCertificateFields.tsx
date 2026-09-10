"use client";

import { useState } from "react";

import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import { ACTIVITY_CERTIFICATE_MODE_LABELS } from "@/features/activities/constants/activity.constants";
import type { ActivityCertificateFieldsProps } from "@/features/activities/components/ActivityCertificateFields/types/activity-certificate-fields.types";
import type { ActivityCertificateMode } from "@/features/activities/types/activity-certificate.types";
import { classNames } from "@/utils/class-names";

const MODE_DESCRIPTIONS: Record<ActivityCertificateMode, string> = {
  included: "Está cubierto por la participación y corresponde a todos los asistentes confirmados.",
  none: "La actividad no comunica ni entrega un certificado.",
  optional_paid: "El participante podrá solicitarlo y coordinar el pago por separado.",
};

const MODES: ActivityCertificateMode[] = ["none", "included", "optional_paid"];

export function ActivityCertificateFields({
  defaultGeneralPrice = 0,
  defaultMemberPrice = 0,
  defaultMode = "none",
  errors,
}: ActivityCertificateFieldsProps) {
  const [mode, setMode] = useState<ActivityCertificateMode>(defaultMode);
  const [generalPrice, setGeneralPrice] = useState(String(defaultGeneralPrice));
  const [memberPrice, setMemberPrice] = useState(String(defaultMemberPrice));
  const hasAdditionalCost = mode === "optional_paid";

  return (
    <fieldset className="space-y-4 border-t border-cci-100 pt-6">
      <div>
        <legend className="text-base font-bold text-cci-950">Certificación de la actividad</legend>
        <p className="mt-1 text-sm text-slate-600">
          Define si el certificado está incluido o se coordina como un beneficio adicional.
        </p>
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        {MODES.map((value) => (
          <label
            className={classNames(
              "cursor-pointer rounded-2xl border p-4 transition focus-within:ring-2 focus-within:ring-cci-300",
              mode === value ? "border-cci-700 bg-cci-50" : "border-slate-200 bg-white hover:border-cci-300",
            )}
            key={value}
          >
            <span className="flex items-start gap-3">
              <input
                checked={mode === value}
                className="mt-1 size-4 accent-cci-800"
                name="certificate_mode"
                onChange={() => setMode(value)}
                type="radio"
                value={value}
              />
              <span>
                <strong className="block text-sm text-cci-950">
                  {ACTIVITY_CERTIFICATE_MODE_LABELS[value]}
                </strong>
                <span className="mt-1 block text-xs leading-5 text-slate-600">
                  {MODE_DESCRIPTIONS[value]}
                </span>
              </span>
            </span>
          </label>
        ))}
      </div>
      {errors?.certificate_mode?.[0] ? (
        <p className="text-sm font-medium text-rose-700">{errors.certificate_mode[0]}</p>
      ) : null}
      {hasAdditionalCost ? (
        <div className="grid gap-5 rounded-2xl bg-slate-50 p-4 md:grid-cols-2">
          <FormField
            error={errors?.certificate_general_price?.[0]}
            hint="Importe adicional; no reemplaza el precio de participación."
            label="Precio general del certificado"
            name="certificate_general_price"
            required
          >
            <Input id="certificate_general_price" min="0.01" name="certificate_general_price" onChange={(event) => setGeneralPrice(event.target.value)} required step="0.01" type="number" value={generalPrice} />
          </FormField>
          <FormField
            error={errors?.certificate_member_price?.[0]}
            hint="Debe ser menor o igual al precio general."
            label="Precio del certificado para asociados"
            name="certificate_member_price"
            required
          >
            <Input id="certificate_member_price" min="0.01" name="certificate_member_price" onChange={(event) => setMemberPrice(event.target.value)} required step="0.01" type="number" value={memberPrice} />
          </FormField>
        </div>
      ) : (
        <>
          <input name="certificate_general_price" type="hidden" value="0" />
          <input name="certificate_member_price" type="hidden" value="0" />
        </>
      )}
    </fieldset>
  );
}
