"use client";

import { useRef } from "react";

import { BillingFields } from "@/features/billing/components/BillingFields";
import type { IndividualBillingFieldsProps } from "@/features/billing/types/billing.types";
import { getIndividualBillingSource } from "@/features/billing/utils/individual-billing-source";

export function IndividualBillingFields({ billing, onChange, errors = {}, allowCompanyCopy }: IndividualBillingFieldsProps) {
  const container = useRef<HTMLDivElement>(null);
  const source = () => {
    const form = container.current?.closest("form");
    return getIndividualBillingSource(form ? new FormData(form) : new FormData(), billing);
  };
  return <div className="border-t border-cci-100 pt-5" ref={container}>
    <BillingFields billing={billing} errors={errors} onChange={onChange} source={billing.type === "factura" && !allowCompanyCopy ? undefined : source} sourceLabel={billing.type === "boleta" ? "Copiar los datos del participante" : "Copiar empresa / organización y RUC"} />
  </div>;
}
