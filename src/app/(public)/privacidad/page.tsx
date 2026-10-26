import Link from "next/link";

import { PRIVACY_CONTACT, PRIVACY_POLICY, PRIVACY_ROUTE } from "@/features/privacy/constants/privacy.constants";
import { buildPageMetadata } from "@/features/seo/services/build-page-metadata";

export const metadata = buildPageMetadata({ title: "Política de privacidad", description: "Conoce cómo la Cámara de Comercio de Ica trata tus datos, gestiona las autorizaciones y atiende tus derechos de privacidad.", path: PRIVACY_ROUTE });

export default function PrivacyPage() {
  return <article className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
    <Link className="inline-flex min-h-11 items-center font-semibold text-cci-800 underline-offset-4 hover:underline" href="/">← Volver al inicio</Link>
    <header className="mb-8 mt-5">
      <p className="text-sm font-semibold text-cci-600">Cámara de Comercio de Ica</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-cci-950 sm:text-4xl">Política de privacidad</h1>
      <p className="mt-3 text-sm text-slate-600">Actualizada el {PRIVACY_POLICY.publishedAt} · Versión {PRIVACY_POLICY.version}</p>
      <p className="mt-5 leading-7 text-slate-700">Queremos que sepas para qué usamos tus datos y cómo puedes decidir sobre ellos.</p>
    </header>
    <div className="space-y-8">{PRIVACY_POLICY.sections.map((section) => <section key={section.title}>
      <h2 className="text-xl font-semibold text-cci-950">{section.title}</h2>
      {section.paragraphs.map((paragraph) => <p className="mt-3 leading-7 text-slate-700" key={paragraph}>{paragraph}</p>)}
    </section>)}</div>
    <aside className="mt-9 rounded-2xl border border-cci-200 bg-cci-50 p-5"><p className="font-semibold text-cci-950">¿Necesitas ayuda con tus datos?</p><a className="mt-2 inline-flex min-h-11 items-center break-all font-medium text-cci-800 underline underline-offset-4" href={`mailto:${PRIVACY_CONTACT}`}>{PRIVACY_CONTACT}</a></aside>
  </article>;
}
