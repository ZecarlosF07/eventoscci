export interface UseCatalogCarouselResult {
  currentIndex: number;
  isAutoPlaying: boolean;
  next: () => void;
  pause: () => void;
  play: () => void;
  previous: () => void;
  select: (index: number) => void;
}
