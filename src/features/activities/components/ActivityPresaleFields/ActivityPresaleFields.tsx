"use client";

import { useState } from "react";

import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import type { ActivityPresaleFieldsProps } from "@/features/activities/components/ActivityPresaleFields/types/activity-presale-fields.types";
import { timestampToPresaleDate } from "@/features/activities/utils/activity-pricing";

export function ActivityPresaleFields({ activity, errors, isFree, membersOnly, status, type }: ActivityPresaleFieldsProps) {
  const [general, setGeneral] = useState(String(activity?.presale_general_price ?? ""));
  const [member, setMember] = useState(String(activity?.presale_member_price ?? ""));
  const [deadline, setDeadline] = useState(timestampToPresaleDate(activity?.presale_ends_at));
  const active = type === "event" && !isFree;
  const hasPresale = Boolean(member || (!membersOnly && general));
  return <>
    <section className="space-y-4 rounded-2xl border border-cci-100 p-4 sm:p-5" hidden={!active}>
      <div><h4 className="font-semibold text-cci-950">Preventa (opcional)</h4><p className="mt-1 text-sm text-slate-600">Déjala vacía para usar el precio regular. Al vencer la fecha, el cambio es automático. El importe se conserva al completar la inscripción.</p></div>
      <div className="grid gap-5 md:grid-cols-2">
        <div hidden={membersOnly}><FormField error={errors?.presale_general_price?.[0]} label="Precio de preventa general" name="presale_general_price" hint="Opcional; menor que el precio regular general.">
          <Input disabled={!active || membersOnly} id="presale_general_price" min="0.01" name="presale_general_price" onChange={(event) => setGeneral(event.target.value)} step="0.01" type="number" value={general} />
        </FormField></div>
        <FormField error={errors?.presale_member_price?.[0]} label="Precio de preventa para asociados" name="presale_member_price" hint="Opcional; menor que el precio regular para asociados.">
          <Input disabled={!active} id="presale_member_price" min="0.01" name="presale_member_price" onChange={(event) => setMember(event.target.value)} step="0.01" type="number" value={member} />
        </FormField>
        <FormField error={errors?.presale_ends_at?.[0]} label="Preventa hasta" name="presale_ends_at" hint="Incluye todo el día seleccionado, según la hora de Perú." required={hasPresale && status === "published"}>
          <Input disabled={!active} id="presale_ends_at" name="presale_ends_at" onChange={(event) => setDeadline(event.target.value)} required={hasPresale && status === "published"} type="date" value={deadline} />
        </FormField>
      </div>
    </section>
    {!active || membersOnly ? <input name="presale_general_price" type="hidden" value="" /> : null}
    {!active ? <><input name="presale_member_price" type="hidden" value="" /><input name="presale_ends_at" type="hidden" value="" /></> : null}
  </>;
}
