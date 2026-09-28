"use client";

import { BillingFields } from "@/features/billing/components/BillingFields";
import type { MemberBillingFieldsProps } from "@/features/member-groups/types/member-group.types";

export function MemberBillingFields({ billing, companyName, companyRuc, errors = {}, onChange }: MemberBillingFieldsProps) {
  return <BillingFields billing={billing} errors={errors} onChange={onChange}
    source={billing.type === "factura" ? () => ({ document: companyRuc, name: companyName }) : undefined}
    sourceLabel="Copiar RUC y razón social de la empresa asociada" />;
}
