"use client";

import { useState } from "react";

import { Checkbox } from "@/components/atoms/Checkbox";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { FormField } from "@/components/molecules/FormField";
import { ActivityPaymentNoteField } from "@/features/activities/components/ActivityPaymentNoteField";
import type { ActivityPricingFieldsProps } from "@/features/activities/components/ActivityPricingFields/types/activity-pricing-fields.types";
import { classNames } from "@/utils/class-names";

export function ActivityPricingFields({
  activity, errors, isFree, membersOnly, onFreeChange, onMembersOnlyChange, status, type,
}: ActivityPricingFieldsProps) {
  const [generalPrice, setGeneralPrice] = useState(String(activity?.general_price ?? ""));
  const [memberPrice, setMemberPrice] = useState(String(activity?.member_price ?? ""));
  const [paymentNote, setPaymentNote] = useState(activity?.payment_note ?? "");
  const published = status === "published";

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-2">
        <Label className={classNames("flex min-h-20 cursor-pointer items-start gap-3 rounded-2xl border p-4 focus-within:ring-2 focus-within:ring-cci-700", membersOnly ? "border-cci-700 bg-cci-50" : "border-slate-200 bg-white hover:border-cci-300")} htmlFor="members_only">
          <Checkbox checked={membersOnly} className="mt-1" id="members_only" name="members_only" onChange={(event) => onMembersOnlyChange(event.target.checked)} />
          <span><strong className="block text-base text-cci-950">Exclusiva para asociados</strong><span className="mt-1 block text-sm leading-5 text-slate-600">Solo los asociados podrán inscribirse. Se mostrará únicamente su tarifa.</span></span>
        </Label>
        <Label className={classNames("flex min-h-20 cursor-pointer items-start gap-3 rounded-2xl border p-4 focus-within:ring-2 focus-within:ring-cci-700", isFree ? "border-cci-700 bg-cci-50" : "border-slate-200 bg-white hover:border-cci-300")} htmlFor="is_free">
          <Checkbox checked={isFree} className="mt-1" id="is_free" name="is_free" onChange={(event) => onFreeChange(event.target.checked)} />
          <span><strong className="block text-base text-cci-950">Actividad gratuita</strong><span className="mt-1 block text-sm leading-5 text-slate-600">No se solicitará pago por la inscripción.</span></span>
        </Label>
      </div>

      {!isFree ? (
        <div className="space-y-5 rounded-2xl border border-cci-100 bg-slate-50 p-4 sm:p-5">
          <div><h4 className="font-semibold text-cci-950">Tarifa de inscripción</h4><p className="mt-1 text-sm text-slate-600">Indica el importe por persona para cada público habilitado.</p></div>
          <div className="grid gap-5 md:grid-cols-2">
            {!membersOnly ? <FormField error={errors?.general_price?.[0]} hint="Importe para quienes no son asociados." label="Tarifa general" name="general_price" required={published}>
              <Input id="general_price" min={published ? "0.01" : "0"} name="general_price" onChange={(event) => setGeneralPrice(event.target.value)} required={published} step="0.01" type="number" value={generalPrice} />
            </FormField> : <input name="general_price" type="hidden" value="0" />}
            <FormField error={errors?.member_price?.[0]} hint="Importe por cada asociado." label="Tarifa para asociados" name="member_price" required={published}>
              <Input id="member_price" min={published ? "0.01" : "0"} name="member_price" onChange={(event) => setMemberPrice(event.target.value)} required={published} step="0.01" type="number" value={memberPrice} />
            </FormField>
          </div>
          <ActivityPaymentNoteField error={errors?.payment_note?.[0]} isFree={false} isPublished={published} onChange={setPaymentNote} value={paymentNote} />
        </div>
      ) : <><input name="general_price" type="hidden" value="0" /><input name="member_price" type="hidden" value="0" /></>}

      <div className="rounded-2xl border border-cci-100 p-4 sm:p-5">
        <FormField error={errors?.capacity?.[0]} hint="Déjalo vacío si no hay límite. Cada asistente ocupa un cupo." label="Cupos disponibles" name="capacity">
          <Input defaultValue={activity?.capacity ?? ""} id="capacity" min="1" name="capacity" type="number" />
        </FormField>
      </div>
      {type === "event" ? (
        <div className="rounded-xl border border-cci-100 bg-cci-50 p-4">
          <Label className="flex min-h-11 cursor-pointer items-center gap-2" htmlFor="is_listed"><Checkbox defaultChecked={activity?.is_listed ?? true} id="is_listed" name="is_listed" /> Mostrar en el portal</Label>
          <p className="mt-2 text-sm text-slate-600">Si lo desactivas, el evento publicado seguirá disponible por enlace directo y aceptará inscripciones, pero no aparecerá en Inicio, Eventos ni la búsqueda.</p>
        </div>
      ) : null}
    </div>
  );
}
