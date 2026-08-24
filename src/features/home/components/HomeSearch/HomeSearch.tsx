export function HomeSearch() {
  return (
    <section aria-labelledby="home-search-title" className="relative z-10 mx-auto -mt-7 w-full max-w-5xl px-5 sm:px-8">
      <form action="/buscar" className="rounded-3xl border border-cci-100 bg-white p-4 shadow-xl shadow-cci-950/8 sm:p-5">
        <label className="font-semibold text-cci-950" htmlFor="home-search" id="home-search-title">
          ¿Qué deseas encontrar?
        </label>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-cci-950 outline-none placeholder:text-slate-400 focus:border-cci-600 focus:ring-2 focus:ring-cci-100"
            id="home-search"
            name="q"
            placeholder="Busca eventos, capacitaciones o cursos"
            required
            type="search"
          />
          <button className="min-h-12 rounded-xl bg-cci-950 px-6 text-sm font-semibold text-white transition hover:bg-cci-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-950" type="submit">Buscar en todo</button>
        </div>
      </form>
    </section>
  );
}
