export function CatalogHeroFallback() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-cci-950">
      <div className="absolute -right-24 -top-40 size-[34rem] rounded-full border border-cci-lime/35" />
      <div className="absolute -right-10 -top-28 size-[27rem] rounded-full border border-cci-lime/20" />
      <div className="absolute -bottom-56 left-[38%] size-[34rem] rounded-full border border-cci-sage/20" />
      <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-br from-cci-800/20 to-cci-lime/10 [clip-path:polygon(45%_0,100%_0,100%_100%,0_100%)]" />
      <span className="absolute bottom-12 right-10 text-7xl font-black tracking-[-0.08em] text-white/5 sm:text-9xl">CCI</span>
    </div>
  );
}
