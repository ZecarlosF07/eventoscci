import { BannerArcField } from "@/components/molecules/BannerImage/BannerArcField";
import { BannerEdgeGlow } from "@/components/molecules/BannerImage/BannerEdgeGlow";
import type { BannerBackdropProps } from "@/components/molecules/BannerImage/types/banner-image.types";

export function BannerBackdrop({ tone = "dark" }: BannerBackdropProps) {
  const expanded = tone === "green";
  const background = expanded ? "from-cci-600 via-cci-800 to-cci-600" : "from-cci-800 via-cci-900 to-cci-950";
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden bg-linear-to-br ${background} [html:has(#pause-banner-motion:checked)_&_*]:[animation-play-state:paused]`}>
      <BannerArcField expanded={expanded} />
      <BannerArcField expanded={expanded} mirrored />
      <div className="absolute inset-0 opacity-0 [mask-image:linear-gradient(to_bottom,transparent_40%,black_48%,black_52%,transparent_60%)] [mask-repeat:no-repeat] [mask-size:100%_300%] motion-safe:animate-banner-cascade motion-safe:opacity-100" data-banner-cascade="">
        <BannerArcField expanded={expanded} illuminated />
        <BannerArcField expanded={expanded} illuminated mirrored />
      </div>
      <BannerEdgeGlow />
    </div>
  );
}
