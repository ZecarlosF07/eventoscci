export function HomeSearch() {
  return (
    <section aria-labelledby="home-search-title" className="relative z-20 mx-auto -mt-6 w-full max-w-7xl px-4 pb-2 sm:px-8">
      <form action="/buscar" className="flex flex-col gap-3 rounded-3xl border border-cci-100 bg-white p-4 shadow-lg shadow-cci-950/5 sm:flex-row sm:items-center sm:gap-4 sm:px-5">
        <label className="sr-only" htmlFor="home-search" id="home-search-title">Busca eventos, capacitaciones o cursos</label>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <svg aria-hidden="true" className="ml-2 size-5 shrink-0 text-cci-600" fill="none" viewBox="0 0 24 24">
            <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.7" />
            <path d="m16 16 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
          </svg>
          <input
            className="min-h-11 w-full min-w-0 rounded-lg bg-white px-2 text-sm text-cci-950 outline-none placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-cci-600"
            id="home-search"
            name="q"
            placeholder="¿Qué te gustaría aprender o explorar?"
            required
            type="search"
          />
        </div>
        <button className="min-h-11 shrink-0 rounded-xl bg-cci-100 px-6 text-sm font-semibold text-cci-950 transition hover:bg-cci-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cci-950" type="submit">Buscar</button>
      </form>
    </section>
  );
}
