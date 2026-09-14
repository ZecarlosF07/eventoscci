import { BannerArcField } from "@/components/molecules/BannerImage/BannerArcField";
import { BannerEdgeGlow } from "@/components/molecules/BannerImage/BannerEdgeGlow";

export function BannerBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden bg-linear-to-br from-cci-800 via-cci-900 to-cci-950 [html:has(#pause-banner-motion:checked)_&_*]:[animation-play-state:paused]">
      <BannerArcField />
      <BannerArcField mirrored />
      <div className="absolute inset-0 opacity-0 [mask-image:linear-gradient(to_bottom,transparent_40%,black_48%,black_52%,transparent_60%)] [mask-repeat:no-repeat] [mask-size:100%_300%] motion-safe:animate-banner-cascade motion-safe:opacity-100" data-banner-cascade="">
        <BannerArcField illuminated />
        <BannerArcField illuminated mirrored />
      </div>
      <BannerEdgeGlow />
    </div>
  );
}
