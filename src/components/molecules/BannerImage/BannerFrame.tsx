import type { BannerFrameProps } from "@/components/molecules/BannerImage/types/banner-frame.types";

/** Keep artwork independent of neighbouring text and grid row heights. */
export function BannerFrame({ children, className = "" }: BannerFrameProps) {
  return (
    <div className={`relative isolate aspect-[5/2] w-full min-w-0 shrink-0 self-start overflow-hidden ${className}`} data-banner-frame="">
      {children}
    </div>
  );
}
