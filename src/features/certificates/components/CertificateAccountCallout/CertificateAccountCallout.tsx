import Link from "next/link";

import type { CertificateAccountCalloutProps } from "@/features/certificates/components/CertificateAccountCallout/types/certificate-account-callout.types";

export function CertificateAccountCallout({ accountHref, accountLabel }: CertificateAccountCalloutProps) {
  return (
    <aside className="relative isolate overflow-hidden rounded-[2rem] border border-cci-100 border-l-4 border-l-cci-lime bg-white px-6 py-8 text-cci-950 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-10 sm:px-10 sm:py-10">
      <span aria-hidden="true" className="absolute -right-20 -top-32 -z-10 size-72 rounded-full border border-cci-200" />
      <span aria-hidden="true" className="absolute -right-10 -top-20 -z-10 size-52 rounded-full border border-cci-100" />
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cci-lime">Tu historial CCI</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Conserva todos tus logros en un solo lugar</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">Al usar el mismo documento con el que participaste, encontrarás este y tus próximos certificados dentro del Campus.</p>
      </div>
      <Link className="mt-6 inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-cci-950 px-6 font-bold text-white transition hover:bg-cci-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cci-800 sm:mt-0 sm:w-auto" href={accountHref}>
        {accountLabel} <span aria-hidden="true">→</span>
      </Link>
    </aside>
  );
}
