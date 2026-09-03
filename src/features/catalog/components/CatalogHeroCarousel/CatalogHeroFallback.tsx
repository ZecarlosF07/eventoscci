export function CatalogHeroFallback() {
  return (
    <div aria-hidden="true" className="absolute inset-0 flex flex-col justify-between overflow-hidden bg-linear-to-br from-cci-800 to-cci-950 p-5 sm:p-8">
      <div className="absolute -right-12 -top-20 size-80 rounded-full border border-cci-lime/25" />
      <div className="absolute -right-3 -top-10 size-60 rounded-full border border-cci-lime/15" />
      <p className="relative text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-cci-sage sm:text-xs">Cámara de Comercio de Ica</p>
      <p className="relative text-3xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">Conecta.<br />Aprende.<br /><span className="text-cci-lime">Crece.</span></p>
      <span className="absolute bottom-5 right-6 text-7xl font-black tracking-tighter text-white/5 sm:text-9xl">CCI</span>
    </div>
  );
}
