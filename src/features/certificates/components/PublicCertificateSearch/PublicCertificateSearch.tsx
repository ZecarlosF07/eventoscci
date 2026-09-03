"use client";

import Link from "next/link";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Spinner } from "@/components/atoms/Spinner";
import { Text } from "@/components/atoms/Text";
import { FormField } from "@/components/molecules/FormField";
import { CertificateRecommendations } from "@/features/certificates/components/CertificateRecommendations";
import { PublicCertificateResults } from "@/features/certificates/components/PublicCertificateResults";
import type { PublicCertificateSearchProps } from "@/features/certificates/components/PublicCertificateSearch/types/public-certificate-search.types";
import { searchPublicCertificates } from "@/features/certificates/mutations/search-public-certificates";
import type { PublicCertificateSearchState } from "@/features/certificates/types/certificate.types";
import { usePersistentAction } from "@/hooks/use-persistent-action";

const INITIAL_STATE: PublicCertificateSearchState = {
  certificates: [],
  recommendations: [],
  status: "idle",
};

export function PublicCertificateSearch({ accountHref, accountLabel }: PublicCertificateSearchProps) {
  const { onSubmit, pending, state } = usePersistentAction(
    searchPublicCertificates,
    INITIAL_STATE,
  );
  const hasResult = state.status !== "idle";

  return (
    <div className="mx-auto w-full max-w-7xl px-5 pb-16 sm:px-8 sm:pb-24">
      <section className="relative z-10 mx-auto -mt-7 max-w-3xl rounded-3xl border border-cci-100 bg-white p-5 shadow-xl shadow-cci-950/10 sm:p-8">
        <form className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end" method="post" onSubmit={onSubmit}>
          <FormField hint="Usa los 8 dígitos de tu documento, sin espacios." label="Número de DNI" name="document_number" required>
            <Input autoComplete="off" disabled={pending} id="document_number" inputMode="numeric" maxLength={8} name="document_number" placeholder="Ejemplo: 12345678" required />
          </FormField>
          <Button className="min-h-11 w-full sm:w-auto" disabled={pending} type="submit">
            {pending ? <><Spinner className="mr-2 border-white/40 border-t-white" /> Consultando…</> : "Consultar certificados"}
          </Button>
        </form>
        <Text className="mt-5 border-t border-cci-100 pt-5" size="sm">
          La consulta queda registrada para fines de control institucional.
        </Text>
      </section>

      {state.message ? (
        <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-cci-200 bg-white p-5 text-center" role="status">
          <p className="font-semibold text-cci-950">{state.message}</p>
        </div>
      ) : null}

      {state.status === "found" ? (
        <div className="mt-12 space-y-14">
          <PublicCertificateResults certificates={state.certificates} participantName={state.participantName} />
          <aside className="rounded-3xl bg-cci-950 px-6 py-8 text-white sm:flex sm:items-center sm:justify-between sm:gap-8 sm:px-9">
            <div><p className="font-semibold text-cci-lime">Conserva tu historial</p><p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">Crea una cuenta o ingresa al Campus para encontrar tus certificados en un solo lugar.</p></div>
            <Link className="mt-5 inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-cci-lime px-5 text-sm font-bold text-cci-950 sm:mt-0" href={accountHref}>{accountLabel}</Link>
          </aside>
          <CertificateRecommendations recommendations={state.recommendations} />
        </div>
      ) : null}

      {!hasResult ? <p className="mt-10 text-center text-sm text-slate-500">También puedes abrir directamente el enlace que recibiste por correo.</p> : null}
    </div>
  );
}
