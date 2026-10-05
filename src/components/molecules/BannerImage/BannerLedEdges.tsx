import type { BannerLedEdgesProps } from "@/components/molecules/BannerImage/types/banner-image.types";

export function BannerLedEdges({ intensity }: BannerLedEdgesProps) {
  const thickness = intensity === "prominent" ? "h-2" : "h-1.5";
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" data-banner-led-edges="">
      <span className={`absolute left-0 top-0 w-1/2 bg-linear-to-r from-transparent via-cci-lime to-transparent shadow-[0_0_16px_var(--color-cci-lime)] ${thickness}`} data-banner-led="top">
        <span className="absolute inset-x-1/4 inset-y-1/4 rounded-full bg-white shadow-[0_0_14px_var(--color-cci-lime)]" />
      </span>
      <span className={`absolute bottom-0 left-0 w-1/2 bg-linear-to-r from-transparent via-cci-lime to-transparent shadow-[0_0_16px_var(--color-cci-lime)] ${thickness}`} data-banner-led="bottom">
        <span className="absolute inset-x-1/4 inset-y-1/4 rounded-full bg-white shadow-[0_0_14px_var(--color-cci-lime)]" />
      </span>
    </div>
  );
}
