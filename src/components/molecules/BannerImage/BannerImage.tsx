import Image from "next/image";

import { BannerBackdrop } from "@/components/molecules/BannerImage/BannerBackdrop";
import type { BannerImageProps } from "@/components/molecules/BannerImage/types/banner-image.types";

/** The static banner covers the animated backdrop, exposing it only in unused space. */
export function BannerImage({ alt, className = "", preload = false, sizes, src }: BannerImageProps) {
  return (
    <div className="absolute inset-0 isolate overflow-hidden">
      <BannerBackdrop />
      <Image
        alt={alt}
        className={`object-contain ${className}`}
        fill
        preload={preload}
        sizes={sizes}
        src={src}
      />
    </div>
  );
}
