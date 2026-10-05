export type BannerBackdropTone = "dark" | "green";
export type BannerBackdropIntensity = "subtle" | "prominent";

export interface BannerLedEdgesProps {
  intensity: BannerBackdropIntensity;
}

export interface BannerBackdropProps {
  intensity?: BannerBackdropIntensity;
  tone?: BannerBackdropTone;
}

export interface BannerImageProps {
  alt: string;
  className?: string;
  backdropTone?: BannerBackdropTone;
  backdropIntensity?: BannerBackdropIntensity;
  preload?: boolean;
  sizes: string;
  src: string;
}
