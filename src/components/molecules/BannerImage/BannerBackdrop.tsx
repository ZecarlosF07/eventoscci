import type { BannerBackdropProps } from "@/components/molecules/BannerImage/types/banner-image.types";

export function BannerBackdrop({ intensity = "subtle", tone = "dark" }: BannerBackdropProps) {
  const background = tone === "green" ? "from-cci-600 via-cci-800 to-cci-600" : "from-cci-800 via-cci-600 to-cci-800";
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden bg-linear-to-br ${background}`} data-banner-backdrop={intensity}>
      <div className="absolute inset-0 bg-linear-to-b from-cci-lime/35 via-transparent to-cci-lime/35" />
      <div className={`absolute inset-0 ${intensity === "prominent" ? "opacity-100" : "opacity-80"}`}>
        <span className="absolute -inset-x-1/4 -inset-y-1/2 bg-radial-[at_20%_25%] from-white/90 via-cci-lime/90 via-25% to-transparent" data-banner-halo="primary" />
        <span className="absolute -inset-x-1/4 -inset-y-1/2 bg-radial-[at_80%_75%] from-white/90 via-cci-lime/90 via-25% to-transparent" data-banner-halo="secondary" />
      </div>
    </div>
  );
}
