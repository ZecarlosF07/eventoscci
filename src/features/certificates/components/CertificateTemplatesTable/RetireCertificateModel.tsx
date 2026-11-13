"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/atoms/Button";
import { FormActionNotice } from "@/components/molecules/FormActionNotice";
import type { RetireCertificateModelProps } from "./types/certificate-templates-table.types";
import { deleteCertificateTemplateAction } from "@/features/certificates/mutations/certificate-template.actions";

export function RetireCertificateModel({ id, name }: RetireCertificateModelProps) {
  const [state, setState] = useState<{ message?: string; success?: boolean }>({});
  const [pending, startTransition] = useTransition();
  return <div className="space-y-2">
    <Button aria-label={`Retirar ${name}`} disabled={pending} variant="subtle" onClick={() => {
      if (!window.confirm(`¿Retirar el modelo «${name}»?`)) return;
      startTransition(async () => {
        try {
          setState(await deleteCertificateTemplateAction(id));
        } catch {
          setState({ message: "No se pudo retirar el modelo. Inténtalo nuevamente." });
        }
      });
    }}>{pending ? "Retirando…" : "Retirar"}</Button>
    <FormActionNotice message={state.message} success={state.success} />
  </div>;
}
