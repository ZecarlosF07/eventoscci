"use client";

import type { ErrorPageProps } from "@/app/types/error-page.types";

export default function GlobalErrorPage({ error, reset }: ErrorPageProps) {
  console.error("Error global de renderizado.", { digest: error.digest });

  return (
    <html lang="es">
      <body className="bg-cci-50 text-cci-950">
        <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6">
          <h1 className="text-3xl font-bold">La plataforma no pudo iniciar</h1>
          <p className="mt-4 text-slate-600">
            Intenta nuevamente. Si el problema continúa, comunícate con la
            Cámara de Comercio de Ica.
          </p>
          <button
            className="mt-8 min-h-11 w-fit rounded-xl bg-cci-950 px-4 py-2 font-semibold text-white"
            onClick={reset}
            type="button"
          >
            Reintentar
          </button>
        </main>
      </body>
    </html>
  );
}
