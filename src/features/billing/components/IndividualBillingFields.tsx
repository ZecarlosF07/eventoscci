"use client";

import { useRef } from "react";

import { BillingFields } from "@/features/billing/components/BillingFields";
import type { IndividualBillingFieldsProps } from "@/features/billing/types/billing.types";

export function IndividualBillingFields({ billing, onChange, errors = {}, allowCompanyCopy }: IndividualBillingFieldsProps) {
  const container = useRef<HTMLDivElement>(null);
  const source = () => {
    const form = container.current?.closest("form");
    const data = form ? new FormData(form) : new FormData();
    const value = (name: string) => String(data.get(name) ?? "");
    return billing.type === "boleta" ? { documentType: value("document_type"), document: value("document_number"), name: `${value("first_names")} ${value("last_names")}`.trim() }
      : { document: value("ruc"), name: value("company"), address: value("address") };
  };
  return <div className="border-t border-cci-100 pt-5" ref={container}>
    <BillingFields billing={billing} errors={errors} onChange={onChange} source={billing.type === "factura" && !allowCompanyCopy ? undefined : source} sourceLabel={billing.type === "boleta" ? "Copiar los datos del participante" : "Copiar los datos de empresa ingresados"} />
  </div>;
}
