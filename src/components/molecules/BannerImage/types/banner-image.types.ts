export type BannerBackdropTone = "dark" | "green";

export interface BannerBackdropProps {
  tone?: BannerBackdropTone;
}

export interface BannerImageProps {
  alt: string;
  className?: string;
  backdropTone?: BannerBackdropTone;
  fit?: "contain" | "cover";
  preload?: boolean;
  sizes: string;
  src: string;
}
