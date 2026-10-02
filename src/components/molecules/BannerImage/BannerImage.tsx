import Image from "next/image";

import { BannerBackdrop } from "@/components/molecules/BannerImage/BannerBackdrop";
import type { BannerImageProps } from "@/components/molecules/BannerImage/types/banner-image.types";

/** The backdrop remains visible around the image's configured framing. */
export function BannerImage({ alt, backdropTone = "dark", className = "", fit = "contain", preload = false, sizes, src }: BannerImageProps) {
  return (
    <div className="absolute inset-0 isolate overflow-hidden">
      <BannerBackdrop tone={backdropTone} />
      <Image
        alt={alt}
        className={`${fit === "cover" ? "object-cover" : "object-contain"} ${className}`}
        fill
        preload={preload}
        sizes={sizes}
        src={src}
      />
    </div>
  );
}
