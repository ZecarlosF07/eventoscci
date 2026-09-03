export function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-cci-950 via-cci-900 to-cci-800" />
      <div className="absolute -right-40 -top-64 size-[48rem] rounded-full border border-cci-lime/10" />
      <div className="absolute -right-20 -top-44 size-[38rem] rounded-full border border-cci-lime/10" />
      <div className="absolute -bottom-40 right-0 size-[35rem] rounded-full bg-cci-lime/5 blur-3xl" />
    </div>
  );
}
