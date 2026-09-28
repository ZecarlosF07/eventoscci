"use client";

import { useRef } from "react";

import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import type { BillingFieldsProps, BillingInput } from "@/features/billing/types/billing.types";
import { copyBillingSource, emptyBilling } from "@/features/billing/utils/billing-input";

export function BillingFields({ billing, onChange, errors = {}, source, sourceLabel }: BillingFieldsProps) {
  const drafts = useRef<Partial<Record<BillingInput["type"], BillingInput>>>({});
  function switchType(type: BillingInput["type"]) {
    drafts.current[billing.type] = billing;
    onChange(drafts.current[type] ?? emptyBilling(type));
  }
  return <fieldset className="space-y-4">
    <legend className="text-lg font-bold text-cci-950">Datos para el comprobante</legend>
    <p className="text-sm text-slate-600">Indica a nombre de quién solicitarás la boleta o factura. Puede ser otra persona o empresa. La emisión se realiza fuera de esta plataforma.</p>
    <div className="grid gap-3 sm:grid-cols-2">{(["boleta", "factura"] as const).map((type) =>
      <label className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 font-semibold ${billing.type === type ? "border-cci-700 bg-cci-50" : "border-cci-100"}`} key={type}>
        <input checked={billing.type === type} name="billing-type" onChange={() => switchType(type)} type="radio" value={type} />{type === "boleta" ? "Boleta" : "Factura"}
      </label>)}</div>
    {source ? <button className="min-h-11 text-left text-sm font-semibold text-cci-700 underline underline-offset-4" onClick={() => onChange(copyBillingSource(billing.type, source()))} type="button">{sourceLabel ?? "Usar los datos ingresados"}</button> : null}
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField error={errors.document} label={billing.type === "factura" ? "RUC para factura" : "DNI para boleta"} name="billing-document" required>
        <Input aria-invalid={Boolean(errors.document)} aria-describedby={errors.document ? "billing-document-error" : undefined} id="billing-document" inputMode="numeric" maxLength={billing.type === "factura" ? 11 : 8} name="billing-document" required value={billing.document} onChange={(event) => onChange({ ...billing, document: event.target.value })} />
      </FormField>
      <FormField error={errors.name} label={billing.type === "factura" ? "Razón social" : "Nombres y apellidos"} name="billing-name" required>
        <Input aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "billing-name-error" : undefined} id="billing-name" maxLength={250} name="billing-name" required value={billing.name} onChange={(event) => onChange({ ...billing, name: event.target.value })} />
      </FormField>
      {billing.type === "factura" ? <FormField error={errors.address} label="Dirección fiscal" name="billing-address" required>
        <Input aria-invalid={Boolean(errors.address)} aria-describedby={errors.address ? "billing-address-error" : undefined} id="billing-address" maxLength={250} name="billing-address" required value={billing.address ?? ""} onChange={(event) => onChange({ ...billing, address: event.target.value })} />
      </FormField> : null}
    </div>
  </fieldset>;
}
