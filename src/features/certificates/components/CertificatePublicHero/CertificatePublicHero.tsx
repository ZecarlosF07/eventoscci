import Link from "next/link";

import { Badge } from "@/components/atoms/Badge";
import { ROUTES } from "@/constants/routes";
import type { CertificatePublicHeroProps } from "@/features/certificates/components/CertificatePublicHero/types/certificate-public-hero.types";

function CertificateCredential({ certificate }: Pick<CertificatePublicHeroProps, "certificate">) {
  return (
    <article className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-white p-5 text-cci-950 shadow-2xl shadow-black/25 sm:p-7">
      <span aria-hidden="true" className="absolute -right-20 -top-20 size-48 rounded-full border border-cci-lime/45" />
      <span aria-hidden="true" className="absolute -right-12 -top-12 size-32 rounded-full border border-cci-100" />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-cci-100 pb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cci-600">Certificación CCI</p>
            <p className="mt-1 text-sm text-slate-500">Documento institucional verificable</p>
          </div>
          <Badge variant={certificate.status === "revoked" ? "warning" : "success"}>
            {certificate.status === "revoked" ? "Revocado" : "Vigente"}
          </Badge>
        </div>

        <div className="py-6">
          <p className="text-sm text-slate-500">Otorgado a</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{certificate.participant_name}</p>
        </div>

        <dl className="grid grid-cols-2 gap-x-5 gap-y-5 border-t border-cci-100 pt-5 text-sm">
          <div className="col-span-2 sm:col-span-1">
            <dt className="text-slate-500">Código</dt>
            <dd className="mt-1 break-all font-mono font-semibold">{certificate.certificate_code}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Tipo</dt>
            <dd className="mt-1 font-semibold">{certificate.certificate_type === "course" ? "Curso" : "Actividad"}</dd>
          </div>
          {certificate.date_text ? <div><dt className="text-slate-500">Fecha</dt><dd className="mt-1 font-semibold">{certificate.date_text}</dd></div> : null}
          {certificate.academic_hours !== null ? <div><dt className="text-slate-500">Horas académicas</dt><dd className="mt-1 font-semibold">{certificate.academic_hours}</dd></div> : null}
        </dl>
      </div>
    </article>
  );
}

export function CertificatePublicHero({ certificate, token }: CertificatePublicHeroProps) {
  const revoked = certificate.status === "revoked";

  return (
    <section className="relative isolate overflow-hidden bg-cci-950 px-5 py-12 text-white sm:px-8 sm:py-16 lg:py-20">
      <div aria-hidden="true" className="absolute -right-40 -top-56 -z-10 size-[36rem] rounded-full border border-cci-lime/15" />
      <div aria-hidden="true" className="absolute -right-24 -top-40 -z-10 size-[27rem] rounded-full border border-white/10" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-linear-to-t from-black/20 to-transparent" />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cci-lime">Un logro que merece ser celebrado</p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-6xl">¡Felicitaciones!</h1>
          <p className="mt-5 text-xl font-semibold leading-snug text-white sm:text-2xl">Tu certificado de {certificate.title} ya está disponible.</p>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/70">Reconocemos tu participación y el compromiso de seguir fortaleciendo tus capacidades junto a la Cámara de Comercio de Ica.</p>

          {revoked ? (
            <div className="mt-7 rounded-2xl border border-amber-300/30 bg-amber-100/10 p-4 text-sm leading-6 text-amber-50">
              Este certificado fue revocado y no está disponible para descarga. {certificate.revocation_reason ? `Motivo: ${certificate.revocation_reason}` : ""}
            </div>
          ) : certificate.download_available ? (
            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <a className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-cci-lime px-6 font-bold text-cci-950 transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cci-lime sm:w-auto" href={`/certificados/${token}/descargar`}>
                Descargar certificado PDF <span aria-hidden="true">↓</span>
              </a>
              <a className="inline-flex min-h-11 items-center gap-2 font-semibold text-white underline decoration-white/30 underline-offset-4 hover:decoration-cci-lime focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cci-lime" href="#proximas-oportunidades">
                Ver próximas actividades <span aria-hidden="true">↓</span>
              </a>
            </div>
          ) : (
            <p className="mt-7 rounded-2xl border border-white/15 bg-white/10 p-4 text-sm leading-6 text-white/80">El archivo todavía está siendo preparado. Podrás descargarlo desde este mismo enlace cuando esté disponible.</p>
          )}

          <p className="mt-7 text-sm text-white/60">¿Buscas otro certificado? <Link className="font-semibold text-white underline decoration-cci-lime underline-offset-4" href={ROUTES.certificates}>Consulta por DNI</Link>.</p>
        </div>

        <CertificateCredential certificate={certificate} />
      </div>
    </section>
  );
}
