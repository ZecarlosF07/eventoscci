const EDGE_GLOW_CLASS_NAME = "absolute left-0 top-0 h-2.5 w-1/2 rounded-full bg-linear-to-r from-transparent via-cci-lime via-75% to-transparent opacity-0 [mask-image:linear-gradient(to_bottom,transparent,black_35%,black_65%,transparent)] motion-safe:animate-banner-edge-glow motion-safe:opacity-100";

export function BannerEdgeGlow() {
  return (
    <div className="absolute inset-0" data-banner-edge-glow="">
      {["top-0 left-0 -scale-x-100", "top-0 right-0", "bottom-0 left-0 -scale-x-100", "bottom-0 right-0"].map((position) => (
        <div className={`absolute h-2.5 w-1/2 overflow-hidden ${position}`} data-banner-half-glow="" key={position}>
          <span className={EDGE_GLOW_CLASS_NAME} />
        </div>
      ))}
    </div>
  );
}
