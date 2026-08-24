"use client";

import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

const DESTINATIONS = new Set(["/eventos", "/capacitaciones", "/cursos"]);

export function HomeSearch() {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = String(formData.get("q") ?? "").trim();
    const selectedDestination = String(formData.get("destination") ?? "");
    const destination = DESTINATIONS.has(selectedDestination) ? selectedDestination : "/eventos";
    const search = query ? `?q=${encodeURIComponent(query)}` : "";

    router.push(`${destination}${search}`);
  }

  return (
    <section aria-labelledby="home-search-title" className="relative z-10 mx-auto -mt-7 w-full max-w-5xl px-5 sm:px-8">
      <form className="rounded-3xl border border-cci-100 bg-white p-4 shadow-xl shadow-cci-950/8 sm:p-5" onSubmit={handleSubmit}>
        <label className="font-semibold text-cci-950" htmlFor="home-search" id="home-search-title">
          ¿Qué deseas aprender o descubrir?
        </label>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_12rem_auto]">
          <input
            className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-cci-950 outline-none placeholder:text-slate-400 focus:border-cci-600 focus:ring-2 focus:ring-cci-100"
            id="home-search"
            name="q"
            placeholder="Ej. marketing, finanzas o transformación digital"
          />
          <label className="sr-only" htmlFor="home-search-destination">Buscar en</label>
          <select className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-cci-950 outline-none focus:border-cci-600 focus:ring-2 focus:ring-cci-100" defaultValue="/eventos" id="home-search-destination" name="destination">
            <option value="/eventos">Eventos</option>
            <option value="/capacitaciones">Capacitaciones</option>
            <option value="/cursos">Cursos</option>
          </select>
          <button className="min-h-12 rounded-xl bg-cci-950 px-6 text-sm font-semibold text-white transition hover:bg-cci-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-950" type="submit">Buscar</button>
        </div>
      </form>
    </section>
  );
}
