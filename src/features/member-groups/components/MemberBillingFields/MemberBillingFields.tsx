"use client";

import { useState } from "react";

import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import type { MemberBillingFieldsProps } from "@/features/member-groups/types/member-group.types";

export function MemberBillingFields({ billing, companyName, companyRuc, errors = {}, onChange }: MemberBillingFieldsProps) {
  const [useCompany, setUseCompany] = useState(billing.type === "factura" && billing.document === companyRuc);
  const update = (patch: Partial<typeof billing>) => onChange({ ...billing, ...patch });
  return (
    <fieldset className="space-y-5">
      <legend className="text-lg font-bold text-cci-950">Datos para el comprobante</legend>
      <p className="text-sm text-slate-600">La CCI emitirá el comprobante fuera de esta plataforma después de validar el pago.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {(["boleta", "factura"] as const).map((type) => (
          <label key={type} className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border p-4 font-semibold ${billing.type === type ? "border-cci-700 bg-cci-50" : "border-cci-100"}`}>
            <input type="radio" name="billing-type" checked={billing.type === type} onChange={() => onChange(type === "factura" ? { type, document: useCompany ? companyRuc : "", name: useCompany ? companyName : "", address: "" } : { type, document: "", name: "" })} />
            {type === "boleta" ? "Boleta" : "Factura"}
          </label>
        ))}
      </div>
      {billing.type === "factura" ? <label className="flex min-h-11 items-center gap-3 text-sm font-medium text-cci-950"><input type="checkbox" checked={useCompany} onChange={(event) => { setUseCompany(event.target.checked); onChange({ ...billing, document: event.target.checked ? companyRuc : "", name: event.target.checked ? companyName : "" }); }} />Usar RUC y razón social de la empresa asociada</label> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField error={errors.document} label={billing.type === "factura" ? "RUC para factura" : "DNI para boleta"} name="billing-document" required>
          <Input aria-invalid={Boolean(errors.document)} id="billing-document" inputMode="numeric" maxLength={billing.type === "factura" ? 11 : 8} required value={billing.document} onChange={(event) => update({ document: event.target.value })} />
        </FormField>
        <FormField error={errors.name} label={billing.type === "factura" ? "Razón social" : "Nombres y apellidos"} name="billing-name" required>
          <Input aria-invalid={Boolean(errors.name)} id="billing-name" maxLength={250} required value={billing.name} onChange={(event) => update({ name: event.target.value })} />
        </FormField>
        {billing.type === "factura" ? (
          <FormField error={errors.address} label="Dirección fiscal" name="billing-address" required>
            <Input aria-invalid={Boolean(errors.address)} id="billing-address" maxLength={250} required value={billing.address ?? ""} onChange={(event) => update({ address: event.target.value })} />
          </FormField>
        ) : null}
      </div>
      {billing.type === "factura" ? <p className="text-sm text-slate-600">Puedes indicar un RUC de facturación distinto del RUC asociado.</p> : null}
    </fieldset>
  );
}
