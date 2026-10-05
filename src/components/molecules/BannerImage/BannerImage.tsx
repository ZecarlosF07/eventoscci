import Image from "next/image";

import { BannerBackdrop } from "@/components/molecules/BannerImage/BannerBackdrop";
import { BannerLedEdges } from "@/components/molecules/BannerImage/BannerLedEdges";
import type { BannerImageProps } from "@/components/molecules/BannerImage/types/banner-image.types";
import { MotionSurface } from "@/components/molecules/MotionSurface/MotionSurface";

/** The backdrop remains visible around the image's configured framing. */
export function BannerImage({ alt, backdropIntensity = "subtle", backdropTone = "dark", className = "", preload = false, sizes, src }: BannerImageProps) {
  return (
    <MotionSurface className="absolute inset-0 isolate overflow-hidden" mode="banner">
      <BannerBackdrop intensity={backdropIntensity} tone={backdropTone} />
      <Image
        alt={alt}
        className={`object-contain object-center ${className}`}
        fill
        preload={preload}
        sizes={sizes}
        src={src}
      />
      <BannerLedEdges intensity={backdropIntensity} />
    </MotionSurface>
  );
}
